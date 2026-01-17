import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class BarberController {
    static async getAvailableSlots(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { date, serviceId } = req.query;

            if (!date || !serviceId) {
                return res.status(400).json({ error: 'Missing date or serviceId' });
            }

            const dateStr = date as string;
            const requestedDate = new Date(dateStr);
            // 0=Sun, 1=Mon, ..., 6=Sat
            const dayOfWeek = requestedDate.getUTCDay();

            // 1. Get Schedule
            const { data: schedule, error: scheduleError } = await supabase
                .from('barber_schedules')
                .select('*')
                .eq('barber_id', id)
                .eq('day_of_week', dayOfWeek)
                .single();

            if (scheduleError || !schedule) {
                // No schedule for this day
                return res.status(200).json({ slots: [] });
            }

            // 2. Get Service Duration
            const { data: service, error: serviceError } = await supabase
                .from('services')
                .select('duration_minutes')
                .eq('id', serviceId)
                .single();

            if (serviceError || !service) {
                return res.status(400).json({ error: 'Service not found' });
            }

            const duration = service.duration_minutes;

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

            for (let current = startTotal; current + duration <= endTotal; current += SLOT_INTERVAL) {
                const slotStartMin = current;
                const slotEndMin = current + duration;

                // Check if overlaps with any appointment
                const isBlocked = appointments?.some(appt => {
                    const apptDate = new Date(appt.scheduled_at);
                    // Adjust to minutes
                    const apptStart = apptDate.getUTCHours() * 60 + apptDate.getUTCMinutes();
                    const apptEnd = apptStart + appt.duration_minutes;

                    // Overlap logic: (StartA < EndB) and (EndA > StartB)
                    return (slotStartMin < apptEnd) && (slotEndMin > apptStart);
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
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'barbeiro')
                .order('name');

            if (error) throw error;
            res.json({ data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to list barbers' });
        }
    }

    static async createBarber(req: Request, res: Response) {
        try {
            const { email, password, name, phone, commission_rate } = req.body;
            // In a real app, hash password here or use Auth service
            // For MVP we just insert. WARNING: Password should be hashed.

            const { data, error } = await supabase
                .from('users')
                .insert({
                    email,
                    password_hash: '$2b$10$placeholder', // TODO: Hash password
                    name,
                    phone,
                    role: 'barbeiro',
                    commission_rate: commission_rate || 40.00
                })
                .select()
                .single();

            if (error) throw error;
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
                .update({ is_active: false })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ message: 'Barber deactivated', data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete barber' });
        }
    }
    static async getSchedule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('barber_schedules')
                .select('*')
                .eq('barber_id', id)
                .order('day_of_week');

            if (error) throw error;
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

            res.json({ message: 'Schedule updated', data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update schedule' });
        }
    }
}
