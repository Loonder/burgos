import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { logger } from '../utils/logger';
import { io } from '../index';

// const paymentService = new PaymentService(); // Removed instantiation

export class PaymentController {
    static async createPayment(req: Request, res: Response) {
        try {
            const { appointmentId, amount, method, userId } = req.body;

            // Basic validation
            if (!appointmentId || !amount || !method) {
                return res.status(400).json({ error: 'Missing required payment fields' });
            }

            const finalUserId = userId || '00000000-0000-0000-0000-000000000000'; // Placeholder logic

            const payment = await paymentService.processPayment({
                appointmentId,
                amount,
                method
            }, finalUserId);

            // Emit real-time event
            io.emit('payment:confirmed', {
                payment,
                appointmentId
            });
            io.emit('appointment:updated', {
                appointment: { id: appointmentId, status: 'finalizado' }
            });

            res.status(201).json({
                success: true,
                message: 'Pagamento confirmado com sucesso',
                data: payment
            });

        } catch (error: any) {
            logger.error('Controller Payment Error', error);
            res.status(500).json({ error: 'Erro ao processar pagamento' });
        }
    }
}
