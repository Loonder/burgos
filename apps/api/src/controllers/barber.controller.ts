import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import { cacheService } from '../services/cache.service';
import {
    DateTimeService,
    parseUTCTimestamp,
    getBusinessDayUTCBounds,
    generateSlotIntervals,
    checkIntervalOverlap,
    createInterval,
    addMinutesToDate,
    toUTCString,
} from '../services/datetime.service';

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

            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
            }

            // Get day of week from business date (using UTC bounds start)
            const { start: dayStartUTC, end: dayEndUTC } = getBusinessDayUTCBounds(dateStr);
            const dayOfWeek = dayStartUTC.getUTCDay();

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
            let idsToCheck: string[] = [];

            if (serviceIds) {
                const sIds = serviceIds as string;
                idsToCheck = sIds.includes(',') ? sIds.split(',') : [sIds];
            } else if (serviceId) {
                idsToCheck = [serviceId as string];
            }

            const { data: services, error: serviceError } = await supabase
                .from('services')
                .select('id, duration_minutes')
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
                return res.status(400).json({ error: `Some services not found: ${missingIds.join(', ')}` });
            }

            // Sum duration of all selected services
            const totalDuration = services.reduce((acc, curr) => acc + curr.duration_minutes, 0);

            // 3. Get Existing Appointments
            // Use UTC bounds for the business day, with buffer for edge cases
            const searchStart = new Date(dayStartUTC);
            searchStart.setDate(searchStart.getDate() - 1);
            const searchEnd = new Date(dayEndUTC);
            searchEnd.setDate(searchEnd.getDate() + 1);

            const { data: appointments, error: apptError } = await supabase
                .from('appointments')
                .select('scheduled_at, duration_minutes')
                .eq('barber_id', id)
                .gte('scheduled_at', toUTCString(searchStart))
                .lte('scheduled_at', toUTCString(searchEnd))
                .neq('status', 'cancelado');

            if (apptError) throw apptError;

            logger.info(`Fetching slots for ${dateStr}. Found ${appointments?.length || 0} appointments in range.`);

            // 4. Generate All Potential Slots using DateTimeService
            const potentialSlots = generateSlotIntervals(
                dateStr,
                schedule.start_time,
                schedule.end_time,
                totalDuration
            );

            // 5. Filter out slots that overlap with existing appointments OR are in the past
            const availableSlots: string[] = [];
            const now = new Date();

            for (const slot of potentialSlots) {
                // Skip past slots
                if (slot.startUTC <= now) {
                    continue;
                }

                const slotInterval = createInterval(slot.startUTC, slot.endUTC);

                const isBlocked = appointments?.some(appt => {
                    // Parse using DateTimeService (handles missing 'Z' centrally)
                    const apptStartUTC = parseUTCTimestamp(appt.scheduled_at);
                    const apptEndUTC = addMinutesToDate(apptStartUTC, appt.duration_minutes);
                    const apptInterval = createInterval(apptStartUTC, apptEndUTC);

                    return checkIntervalOverlap(slotInterval, apptInterval);
                });

                if (!isBlocked) {
                    availableSlots.push(slot.localTime);
                }
            }

            logger.info(`Available slots for barber ${id} on ${dateStr}:`, {
                totalPotentialSlots: potentialSlots.length,
                availableSlots: availableSlots.length,
                existingAppointments: appointments?.length || 0,
                appointmentsDetail: appointments?.map(a => ({
                    scheduled_at: a.scheduled_at,
                    duration: a.duration_minutes
                })),
                slotsReturned: availableSlots.slice(0, 5)
            });

            res.status(200).json({ slots: availableSlots });
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
