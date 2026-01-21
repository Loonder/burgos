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
                return res.status(400).json({ error: 'Missing date or serviceId(s)' });
            }

            const dateStr = date as string;
            const requestedDate = new Date(dateStr);
            const dayOfWeek = requestedDate.getUTCDay();

            // 1. Get Schedule
            const { data: schedule, error: scheduleError } = await supabase
                .from('barber_schedules')
                .select('*')
                .eq('barber_id', id)
                .eq('day_of_week', dayOfWeek)
                .single();

            if (scheduleError || !schedule) {
                return res.status(200).json({ slots: [] });
            }

            // 2. Get Service Duration(s)
            let duration = 0;
            const idsToCheck = serviceIds
                ? (serviceIds as string).split(',')
                : [serviceId as string];

            const { data: services, error: serviceError } = await supabase
                .from('services')
                .select('duration_minutes')
                .in('id', idsToCheck);

            if (serviceError || !services || services.length === 0) {
                return res.status(400).json({ error: 'Services not found' });
            }

            // Sum duration of all selected services
            duration = services.reduce((acc, curr) => acc + curr.duration_minutes, 0);

            // 3. Get Existing Appointments
            const { data: appointments, error: apptError } = await supabase
                .from('appointments')
                .select('scheduled_at, duration_minutes')
                .eq('barber_id', id)
                .eq('scheduled_at::date', dateStr)
                .neq('status', 'cancelado');

            if (apptError) throw apptError;

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
            const APPOINTMENT_BUFFER_MIN = 2; // Buffer after every appointment

            for (let current = startTotal; current + duration <= endTotal; current += SLOT_INTERVAL) {
                const slotStartMin = current;
                const slotEndMin = current + duration;

                // Effective end for blocking purposes (includes buffer)
                const slotEndWithBuffer = slotEndMin + APPOINTMENT_BUFFER_MIN;

                // Check if overlaps with any appointment
                const isBlocked = appointments?.some(appt => {
                    const apptDate = new Date(appt.scheduled_at);
                    // Adjust to minutes
                    const apptStart = apptDate.getUTCHours() * 60 + apptDate.getUTCMinutes();
                    const apptEnd = apptStart + appt.duration_minutes;
                    const apptEndWithBuffer = apptEnd + APPOINTMENT_BUFFER_MIN;

                    // Overlap logic: 
                    // 1. Candidate Slot overlaps Existing Appointment (considering Existing's buffer)
                    // 2. Existing Appointment overlaps Candidate Slot (considering Candidate's buffer)
                    // Formula: (StartA < EndB) && (EndA > StartB)

                    // We check if "Slot (extended)" overlaps "Appt" OR "Slot" overlaps "Appt (extended)"
                    // Actually simplier: Treat BOTH as having extended duration for the check?
                    // If A finishes at 10:00 (10:02 buffered), B starts at 10:00. 
                    // B.Start (10:00) < A.EndBuffer (10:02) -> Overlap! Correct.

                    // If B finishes at 10:00 (10:02 buffered), A starts at 10:00.
                    // B.EndBuffer (10:02) > A.Start (10:00) -> Overlap! Correct.

                    return (slotStartMin < apptEndWithBuffer) && (slotEndWithBuffer > apptStart);
                });

                if (!isBlocked) {
                    // Convert back to HH:MM
                    const h = Math.floor(current / 60).toString().padStart(2, '0');
                    const m = (current % 60).toString().padStart(2, '0');
                    slots.push(`${h}:${m}`);
                }
            }

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
