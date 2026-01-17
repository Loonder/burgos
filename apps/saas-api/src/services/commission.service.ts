import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class CommissionService {
    // Calculate and log commission for a completed appointment
    static async processCommission(appointmentId: string) {
        try {
            // 1. Get Appointment Details (including Service Price & Barber)
            const { data: appointment, error } = await supabase
                .from('appointments')
                .select(`
                    id,
                    barber_id,
                    status,
                    service:services(id, price)
                `)
                .eq('id', appointmentId)
                .single();

            if (error || !appointment) {
                logger.error('Commission: Appointment not found', error);
                return;
            }

            if (appointment.status !== 'finalizado' && appointment.status !== 'completed') {
                logger.warn(`Commission: Appointment ${appointmentId} is not finished yet.`);
                return; // Commission is only for finished appointments
            }

            // 2. Calculate Commission
            // Note: We use the SERVICE PRICE, not the transaction amount.
            // This ensures VIPs (who pay 0) still generate commission.
            const servicePrice = (appointment.service as any)?.price || 0;

            // Fetch barber custom rate
            const { data: barber } = await supabase
                .from('users')
                .select('commission_rate')
                .eq('id', appointment.barber_id)
                .single();

            const commissionRate = barber?.commission_rate || 40.00; // Default 40%
            const commissionAmount = (servicePrice * commissionRate) / 100;

            if (commissionAmount <= 0) return;

            // 3. Insert into Commissions Table
            const { error: insertError } = await supabase
                .from('commissions')
                .insert({
                    barber_id: appointment.barber_id,
                    appointment_id: appointment.id,
                    service_id: (appointment.service as any)?.id,
                    amount: commissionAmount,
                    percentage: commissionRate,
                    status: 'pending' // Pending until payout
                });

            if (insertError) {
                logger.error('Error inserting commission', insertError);
            } else {
                logger.info(`Commission generated: R$ ${commissionAmount} for Barber ${appointment.barber_id}`);
            }

        } catch (error) {
            logger.error('Process Commission Error', error);
        }
    }
}
