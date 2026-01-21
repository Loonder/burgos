import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import { cacheService } from '../services/cache.service';

export class BarberController {
    static async getAvailableSlots(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { date, serviceId, serviceIds } = req.query;

            if (!date || (!serviceId && !serviceIds)) {
                logger.warn(`Missing date or serviceId(s). Query: ${JSON.stringify(req.query)}`);
                return res.status(400).json({ error: '[DEBUG] Missing date or serviceId(s)' });
            }

            const dateStr = date as string;
            const requestedDate = new Date(dateStr);
            if (isNaN(requestedDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date format' });
            }
            const dayOfWeek = requestedDate.getUTCDay();

            // 1. Get Schedule
            const { data: schedule, error: scheduleError } = await supabase
                .from('barber_schedules')
                .select('*')
                .eq('barber_id', id)
                .eq('day_of_week', dayOfWeek)
                .single();

            if (scheduleError || !schedule) {
                // Not an error, just no slots (barber not working)
                return res.status(200).json({ slots: [] });
            }

            // 2. Get Service Duration(s)
            let duration = 0;
            let idsToCheck: string[] = [];

            if (serviceIds) {
                const sIds = serviceIds as string; // Handle potential array if needed? Usually string in Express query
                idsToCheck = sIds.includes(',') ? sIds.split(',') : [sIds];
            } else if (serviceId) {
                idsToCheck = [serviceId as string];
            }

            const { data: services, error: serviceError } = await supabase
                .from('services')
                .select('id, duration_minutes') // Select ID too for verification
                .in('id', idsToCheck);

            if (serviceError || !services || services.length === 0) {
                logger.warn(`Services not found for IDs: ${idsToCheck.join(', ')}`);
                return res.status(400).json({ error: `Services not found: ${idsToCheck.join(', ')}` });
            }

            // Check if ALL requested services exist
            if (services.length !== idsToCheck.length) {
                const foundIds = services.map(s => s.id);
                const missingIds = idsToCheck.filter(id => !foundIds.includes(id));
                logger.warn(`Some services not found: ${missingIds.join(', ')}`);
                // Proceed with found ones? Or error? Strict mode: Error.
                return res.status(400).json({ error: `Some services not found: ${missingIds.join(', ')}` });
            }

            // Sum duration of all selected services
            duration = services.reduce((acc, curr) => acc + curr.duration_minutes, 0);

            // 3. Get Existing Appointments
            // Widen range to handle timezone boundaries safely (Yesterday/Today/Tomorrow relative to UTC)
            // requestedDate is UTC Midnight of the requested day
            const searchStart = new Date(requestedDate);
            searchStart.setDate(searchStart.getDate() - 1); // Look back 1 day
            const searchEnd = new Date(requestedDate);
            searchEnd.setDate(searchEnd.getDate() + 2); // Look forward 2 days (total 3 days coverage)

            // Simplification: Just take the whole window around the date to be safe
            const { data: appointments, error: apptError } = await supabase
                .from('appointments')
                .select('scheduled_at, duration_minutes')
                .eq('barber_id', id)
                .gte('scheduled_at', searchStart.toISOString())
                .lte('scheduled_at', searchEnd.toISOString())
                .neq('status', 'cancelado');

            if (apptError) throw apptError;

            logger.info(`Fetching slots for ${dateStr}. Found ${appointments?.length} appointments.`);

            // 4. Generate All Slots
            const slots: string[] = [];

            // Parse start/end times (HH:MM:SS)
            const [startH, startM] = schedule.start_time.split(':').map(Number);
            const [endH, endM] = schedule.end_time.split(':').map(Number);

            // Convert everything to minutes from midnight for easier calculation
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;

            // Slot interval (e.g., 30 mins)
            const SLOT_INTERVAL = 30;
            const APPOINTMENT_BUFFER_MIN = 0; // Buffer REMOVED to prevent overlap
            const BUFFER_MS = APPOINTMENT_BUFFER_MIN * 60 * 1000;

            // Base Date for Slots (Strict BRT -03:00)
            const baseDateInfo = new Date(`${dateStr}T00:00:00-03:00`);
            const baseEpoch = baseDateInfo.getTime();

            for (let current = startTotal; current + duration <= endTotal; current += SLOT_INTERVAL) {
                // Calculated Slot Times in Epoch (Absolute Time)
                // current is minutes from midnight BRT
                const slotStartMs = baseEpoch + (current * 60 * 1000);
                const slotEndMs = slotStartMs + (duration * 60 * 1000);
                const slotEndWithBuffer = slotEndMs + BUFFER_MS;

                // Check if overlaps with any appointment
                const isBlocked = appointments?.some(appt => {
                    const apptStartMs = new Date(appt.scheduled_at).getTime();
                    const apptEndMs = apptStartMs + (appt.duration_minutes * 60 * 1000);
                    const apptEndWithBuffer = apptEndMs + BUFFER_MS;

                    // Overlap: (StartA < EndB) && (EndA > StartB)
                    return (slotStartMs < apptEndWithBuffer) && (slotEndWithBuffer > apptStartMs);
                });

                if (!isBlocked) {
                    // Convert back to HH:MM
                    const h = Math.floor(current / 60).toString().padStart(2, '0');
                    const m = (current % 60).toString().padStart(2, '0');
                    slots.push(`${h}:${m}`);
                }
            }

            logger.info(`Available slots for barber ${id} on ${dateStr}:`, {
                totalSlots: slots.length,
                existingAppointments: appointments?.length || 0,
                appointmentsDetail: appointments?.map(a => ({
                    scheduled_at: a.scheduled_at,
                    localTime: new Date(a.scheduled_at).toLocaleTimeString('pt-BR'),
                    duration: a.duration_minutes
                })),
                slotsReturned: slots.slice(0, 5) // First 5 slots for debug
            });

            res.status(200).json({ slots });
        } catch (error: any) {
            logger.error('Error fetching slots', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    // ADMIN CRUD
    static async listBarbers(req: Request, res: Response) {
        try {
            const cacheKey = 'barbers';
            const cached = cacheService.get(cacheKey);
            if (cached) return res.json({ data: cached });

            const { data, error } = await supabase
                .from('users')
                .select('id, email, name, phone, role, avatar_url, commission_rate, is_active, created_at')
                .eq('role', 'barbeiro')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;

            cacheService.set(cacheKey, data);
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to list barbers' });
        }
    }

    static async createBarber(req: Request, res: Response) {
        try {
            const { email, password, name, phone, commission_rate } = req.body;

            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const { data, error } = await supabase
                .from('users')
                .insert({
                    email,
                    password_hash: passwordHash,
                    name,
                    phone,
                    role: 'barbeiro',
                    commission_rate: commission_rate || 40.00
                })
                .select()
                .single();

            if (error) throw error;

            cacheService.del('barbers');
            res.status(201).json({ message: 'Barber created', data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create barber' });
        }
    }

    static async updateBarber(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            cacheService.del('barbers');
            res.json({ message: 'Barber updated', data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update barber' });
        }
    }

    static async deleteBarber(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('users')
                .update({ is_active: false, deleted_at: new Date() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            cacheService.del('barbers');
            res.json({ message: 'Barber deactivated', data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete barber' });
        }
    }
    static async getSchedule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const cacheKey = `schedule:${id}`;
            const cached = cacheService.get(cacheKey);
            if (cached) return res.json({ schedule: cached });

            const { data, error } = await supabase
                .from('barber_schedules')
                .select('*')
                .eq('barber_id', id)
                .order('day_of_week');

            if (error) throw error;

            cacheService.set(cacheKey, data);
            res.json({ schedule: data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch schedule' });
        }
    }

    static async updateSchedule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { schedule } = req.body; // Array of { day_of_week, start_time, end_time, is_active }

            // Validate using a transaction-like approach or just batch upsert
            // For Supabase, upsert works well.

            const upsertData = schedule.map((item: any) => ({
                barber_id: id,
                day_of_week: item.day_of_week,
                start_time: item.start_time,
                end_time: item.end_time,
                // We might need to handle deletions or deactivation manually if implicit
            }));

            // First, delete existing to handle "disabled" days cleanly (or use is_active column if exists)
            // Simpler approach: Delete all for this barber, then insert new.
            await supabase.from('barber_schedules').delete().eq('barber_id', id);

            const { data, error } = await supabase
                .from('barber_schedules')
                .insert(upsertData)
                .select();

            if (error) throw error;

            cacheService.del(`schedule:${id}`);
            res.json({ message: 'Schedule updated', data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update schedule' });
        }
    }
}
