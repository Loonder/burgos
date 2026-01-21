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
    productIds?: string[];
    serviceIds?: string[]; // New field
}

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const body = req.body as AppointmentBody;
        let { serviceId, serviceIds, barberId, date, time, preferences, productIds } = body;

        // Support Legacy: If only serviceId provided, treat as single item array
        if (!serviceIds && serviceId) {
            serviceIds = [serviceId];
        }

        if (!serviceIds || serviceIds.length === 0 || !barberId || !date || !time) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Primary Service ID (for legacy compatibility in appointments table)
        const primaryServiceId = serviceIds[0];
        // STRICT BRT (-03:00)
        const scheduledAt = new Date(`${date}T${time}:00-03:00`);
        let clientId = req.user?.id;

        // Allow Admin/Barber to book for others
        if ((req.user?.role === 'admin' || req.user?.role === 'barbeiro') && body.clientId) {
            clientId = body.clientId;
        }

        if (!clientId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        logger.info('Creating appointment', { clientId, serviceIds, barberId, scheduledAt, productIds });

        // 0. Fetch Subscription (if exists)
        const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select(`
                plan_id, status,
                plan:plans (
                    id, name,
                    discounts:plan_discounts (
                        service_id, is_free, discount_percentage
                    )
                )
            `)
            .eq('user_id', clientId)
            .eq('status', 'active')
            .gt('current_period_end', new Date().toISOString())
            .single();

        // 0.5 Calculate Totals & Individual Service Data
        let totalDuration = 0;
        let totalPrice = 0;
        const servicesToInsert: any[] = [];

        // Fetch all service details
        const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('id, name, price, duration_minutes')
            .in('id', serviceIds);

        if (servicesError || !servicesData || servicesData.length !== serviceIds.length) {
            return res.status(400).json({ error: 'One or more services not found' });
        }

        // Process each service
        for (const service of servicesData) {
            totalDuration += service.duration_minutes;
            let finalServicePrice = service.price;

            // Apply Discount if Subscribed
            if (subscription && subscription.plan) {
                const planData = subscription.plan as any;
                if (planData.discounts) {
                    const discountRule = planData.discounts.find((d: any) => d.service_id === service.id);
                    if (discountRule) {
                        if (discountRule.is_free) {
                            finalServicePrice = 0;
                            logger.info(`Applying 100% discount for service ${service.id}`);
                        } else if (discountRule.discount_percentage > 0) {
                            const discountAmount = (service.price * discountRule.discount_percentage) / 100;
                            finalServicePrice = Math.max(0, service.price - discountAmount);
                            logger.info(`Applying ${discountRule.discount_percentage}% discount for service ${service.id}`);
                        }
                    }
                }
            }

            totalPrice += finalServicePrice;
            servicesToInsert.push({
                service_id: service.id,
                price: finalServicePrice
            });
        }

        // CRITICAL: Check for time slot conflicts BEFORE creating appointment
        const appointmentEndTime = new Date(scheduledAt.getTime() + totalDuration * 60000);

        // Widen search range to include adjacent days (handle timezone spillover)
        const searchStart = new Date(scheduledAt);
        searchStart.setDate(searchStart.getDate() - 1);
        const searchEnd = new Date(scheduledAt);
        searchEnd.setDate(searchEnd.getDate() + 2);

        const { data: existingAppointments, error: conflictError } = await supabase
            .from('appointments')
            .select('id, scheduled_at, duration_minutes')
            .eq('barber_id', barberId)
            .gte('scheduled_at', searchStart.toISOString())
            .lte('scheduled_at', searchEnd.toISOString())
            .neq('status', 'cancelado');

        if (conflictError) {
            logger.error('Error checking for conflicts', conflictError);
            throw conflictError;
        }

        // Check overlap with existing appointments
        const hasConflict = existingAppointments?.some(existing => {
            const existingStart = new Date(existing.scheduled_at).getTime();
            const existingEnd = existingStart + existing.duration_minutes * 60000;
            const newStart = scheduledAt.getTime();
            const newEnd = appointmentEndTime.getTime();

            // Overlap: (StartA < EndB) && (EndA > StartB)
            return (newStart < existingEnd) && (newEnd > existingStart);
        });

        if (hasConflict) {
            logger.warn('Time slot conflict detected', { barberId, scheduledAt, existingAppointments });
            return res.status(409).json({
                error: 'Horário já está ocupado. Por favor, escolha outro horário.',
                code: 'SLOT_CONFLICT'
            });
        }

        // 1. Create Appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                client_id: clientId,
                barber_id: barberId,
                service_id: primaryServiceId, // Legacy
                scheduled_at: scheduledAt.toISOString(),
                duration_minutes: totalDuration, // Sum of durations
                preferences: preferences || {},
                status: 'agendado',
            })
            .select()
            .single();

        if (error) {
            logger.error('Supabase error creating appointment', error);
            // Handle unique constraint violation (backup check)
            if (error.code === '23505' || error.message?.includes('unique constraint')) {
                return res.status(409).json({
                    error: 'Horário já está ocupado. Por favor, escolha outro horário.',
                    code: 'SLOT_CONFLICT'
                });
            }
            throw error;
        }

        // 1.5 Insert Appointment Services (Join Table)
        const appointmentServicesData = servicesToInsert.map(s => ({
            appointment_id: appointment.id,
            service_id: s.service_id,
            price: s.price
        }));

        const { error: batchError } = await supabase
            .from('appointment_services')
            .insert(appointmentServicesData);

        if (batchError) {
            logger.error('Error inserting appointment services', batchError);
            // Non-critical (?) or critical? If this fails, we lose track of services.
            // Ideally should rollback, but Supabase HTTP API doesn't support generic transactions easily without RPC.
            // For now, log it.
        }

        // 1.6 Create Payment
        await supabase.from('payments').insert({
            appointment_id: appointment.id,
            amount: totalPrice,
            method: totalPrice === 0 ? 'pix' : 'dinheiro',
            status: totalPrice === 0 ? 'confirmado' : 'pendente',
            confirmed_at: totalPrice === 0 ? new Date() : null
        });

        // 2. Add Products (if any)
        if (productIds && productIds.length > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('id, price')
                .in('id', productIds);

            if (products && products.length > 0) {
                const appointmentProducts = products.map(p => ({
                    appointment_id: appointment.id,
                    product_id: p.id,
                    quantity: 1,
                    price_at_purchase: p.price
                }));
                await supabase.from('appointment_products').insert(appointmentProducts);
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
                service:services(id, name, price, duration_minutes),
                appointment_services(
                    service_id,
                    price,
                    service:services(id, name, price, duration_minutes)
                )
            `)
            .order('scheduled_at', { ascending: true });

        // Force filter for non-privileged users
        if (userRole !== 'admin' && userRole !== 'barbeiro' && userRole !== 'recepcionista') {
            // Regular clients can ONLY see their own appointments
            query = query.eq('client_id', userId);
        } else {
            // Admins/Barbers/Receptionists can filter by params
            if (clientId) query = query.eq('client_id', clientId);

            // SPECIAL: If Barber logs in and doesn't specify a barberId, show THEIR own schedule by default
            // This prevents them from seeing "All" or "Nothing" depending on frontend quirk,
            // and ensures "My Agenda" feeling.
            if (userRole === 'barbeiro' && !barberId) {
                query = query.eq('barber_id', userId);
            }
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
