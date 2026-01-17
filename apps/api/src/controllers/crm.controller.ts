import { Request, Response } from 'express';
import { supabase } from '../config/database';

export const getCRMAlerts = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const todayStr = today.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // 1. Confirmations (Tomorrow)
        const { data: confirmations } = await supabase
            .from('appointments')
            .select('*, client:users!client_id(name, phone), barber:users!barber_id(name)')
            .eq('scheduled_at::date', tomorrowStr)
            .eq('status', 'agendado');

        // 2. Reminders (Today, upcoming)
        // Simple logic: All appointments for today that are 'agendado'
        const { data: reminders } = await supabase
            .from('appointments')
            .select('*, client:users!client_id(name, phone), barber:users!barber_id(name)')
            .eq('scheduled_at::date', todayStr)
            .eq('status', 'agendado');

        // 3. Birthdays (This is trickier in Supabase without raw SQL if MM-DD matches)
        // We will fetch all users and filter in JS for now (MVP) or use a raw query if enabled.
        // For MVP/Speed: Fetch user birthdays.
        const { data: users } = await supabase
            .from('users')
            .select('id, name, phone, birth_date, last_appointment_at')
            .eq('role', 'cliente');

        const birthdays = users?.filter((u: any) => {
            if (!u.birth_date) return false;
            const bdate = new Date(u.birth_date);
            return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
        }) || [];

        // 4. Retention (Inactive > 30 days)
        // Relying on 'last_appointment_at' column if it exists, otherwise complex query.
        // Assuming we might not have 'last_appointment_at' updated yet, let's skip or try best effort.
        // We'll filter the fetched users.
        const retention = users?.filter((u: any) => {
            if (!u.last_appointment_at) return false; // New users are not "lost" yet
            const last = new Date(u.last_appointment_at);
            return last < thirtyDaysAgo;
        }) || [];

        return res.json({
            confirmations: confirmations || [],
            reminders: reminders || [],
            birthdays,
            retention
        });

    } catch (error) {
        console.error('CRM Alert Error', error);
        return res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};
