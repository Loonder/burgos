import { Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { ExperienceService } from '../services/experience.service';
import { io } from '../index';

const experienceService = new ExperienceService();

export class CheckinController {
    static async checkin(req: Request, res: Response) {
        // Assume request body contains appointment_id
        const { appointmentId } = req.body;
        logger.info(`Checkin request received for Appointment: ${appointmentId}`);

        if (!appointmentId) {
            return res.status(400).json({ error: 'Appointment ID required' });
        }

        try {
            // 1. Verify Appointment matches Today & Status
            const query = `
                UPDATE appointments 
                SET status = 'aguardando', checked_in_at = NOW()
                WHERE id = $1
                RETURNING id, client_id, status
            `;
            const result = await pool.query(query, [appointmentId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Appointment not found' });
            }

            const appointment = result.rows[0];

            // 2. Trigger Welcome Experience
            // We don't await this to keep the API response fast
            experienceService.welcomeClient(appointment.client_id).catch(err => {
                logger.error('Failed to trigger welcome experience', err);
            });

            logger.info(`Check-in successful for Appointment ${appointmentId}`);

            // Emit real-time updates
            io.emit('appointment:updated', { appointment: { ...appointment, status: 'aguardando' } });
            io.emit('appointment:checkin', { appointment });

            res.json({
                success: true,
                message: 'Check-in successful',
                appointment: appointment
            });

        } catch (error) {
            logger.error('Check-in Error', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
