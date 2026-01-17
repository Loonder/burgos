import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import { io } from '../index'; // Import socket instance

interface AppointmentBody {
    serviceId: string;
    barberId: string;
    date: string;
    time: string;
    preferences: Record<string, any>;
    clientId?: string;
    productIds?: string[]; // New field
}

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const body = req.body as AppointmentBody;
        const { serviceId, barberId, date, time, preferences, productIds } = body;

        if (!serviceId || !barberId || !date || !time) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const scheduledAt = new Date(`${date}T${time}:00`);
        let clientId = req.user?.id;

        // Allow Admin/Barber to book for others
        if ((req.user?.role === 'admin' || req.user?.role === 'barbeiro') && body.clientId) {
            clientId = body.clientId;
        }

        if (!clientId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        logger.info('Creating appointment for client', { clientId, serviceId, barberId, scheduledAt, productIds });

        // 1. Create Appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                client_id: clientId,
                barber_id: barberId,
                service_id: serviceId,
                scheduled_at: scheduledAt.toISOString(),
                duration_minutes: 45,
                preferences: preferences || {},
                status: 'agendado'
            })
            .select()
            .single();

        if (error) {
            logger.error('Supabase error creating appointment', error);
            throw error;
        }

        // 2. Add Products (if any)
        if (productIds && productIds.length > 0) {
            // Fetch products to get current prices
            const { data: products } = await supabase
                .from('products')
                .select('id, price')
                .in('id', productIds);

            if (products && products.length > 0) {
                const appointmentProducts = products.map(p => ({
                    appointment_id: appointment.id,
                    product_id: p.id,
                    quantity: 1, // Default to 1 for now
                    price_at_purchase: p.price
                }));

                const { error: prodError } = await supabase
                    .from('appointment_products')
                    .insert(appointmentProducts);

                if (prodError) {
                    logger.error('Error adding products to appointment', prodError);
                    // Continue, don't fail the appointment
                }
            }
        }

        // Emit real-time event
        io.emit('appointment:created', { appointment });

        res.status(201).json({ message: 'Appointment created successfully', data: appointment });
    } catch (error: any) {
        logger.error('Error creating appointment', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const { date, startDate, endDate, clientId, barberId, status } = req.query;

        const userId = req.user?.id;
        const userRole = req.user?.role;

        let query = supabase
            .from('appointments')
            .select(`
                *,
                client:users!client_id(id, name, phone, avatar_url),
                barber:users!barber_id(id, name, avatar_url),
                service:services(id, name, price, duration_minutes)
            `)
            .order('scheduled_at', { ascending: true });

        // Force filter for non-privileged users
        if (userRole !== 'admin' && userRole !== 'barbeiro') {
            // Regular clients can ONLY see their own appointments
            query = query.eq('client_id', userId);
        } else {
            // Admins/Barbers can filter by params
            if (clientId) query = query.eq('client_id', clientId);
        }

        if (date) query = query.eq('scheduled_at::date', date);
        if (startDate) query = query.gte('scheduled_at', startDate);
        if (endDate) query = query.lte('scheduled_at', endDate);
        if (barberId) query = query.eq('barber_id', barberId);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ data });
    } catch (error: any) {
        logger.error('Error fetching appointments', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                client:users!client_id(id, name, phone, avatar_url),
                barber:users!barber_id(id, name, avatar_url),
                service:services(id, name, price)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Appointment not found' });

        res.status(200).json({ data });
    } catch (error: any) {
        logger.error('Error fetching appointment', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // 1. Fetch existing appointment to verify ownership
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select('client_id')
            .eq('id', id)
            .single();

        if (fetchError || !appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // 2. Check permissions (Admin/Barber OR Owner)
        if (userRole !== 'admin' && userRole !== 'barbeiro' && appointment.client_id !== userId) {
            logger.warn(`Unauthorized update attempt by user ${userId} on appointment ${id}`);
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { data, error } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Emit update event
        io.emit('appointment:updated', { appointment: data });

        // Trigger Commission Calculation if finished
        if (updates.status === 'finalizado' || updates.status === 'completed') {
            const { CommissionService } = require('../services/commission.service'); // Lazy load to avoid circular deps if any
            // Run async, don't block response
            CommissionService.processCommission(id).catch((err: any) => logger.error('Async commission error', err));
        }

        res.status(200).json({ message: 'Appointment updated', data });
    } catch (error: any) {
        logger.error('Error updating appointment', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const cancelAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // 1. Fetch existing appointment
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select('client_id')
            .eq('id', id)
            .single();

        if (fetchError || !appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // 2. Check permissions
        if (userRole !== 'admin' && userRole !== 'barbeiro' && appointment.client_id !== userId) {
            logger.warn(`Unauthorized cancel attempt by user ${userId} on appointment ${id}`);
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelado' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Emit cancellation event
        io.emit('appointment:cancelled', { id, appointment: data });

        res.status(200).json({ message: 'Appointment cancelled', data });
    } catch (error: any) {
        logger.error('Error cancelling appointment', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

// Note: Ensure checkin logic is consolidated. 
// If using CheckinController, this might be redundant or unused.
export const checkInAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('appointments')
            .update({
                status: 'aguardando',
                checked_in_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        logger.info(`Appointment ${id} checked in`);

        io.emit('appointment:updated', { appointment: data });
        io.emit('appointment:checkin', { appointment: data });

        res.status(200).json({ message: 'Check-in successful', data });
    } catch (error: any) {
        logger.error('Error checking in appointment', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
