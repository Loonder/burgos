import { Request, Response } from 'express';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

export class DashboardController {
    static async getStats(req: Request, res: Response) {
        try {
            // Parallelize queries for performance
            const [
                dailyAppointments,
                totalRevenue,
                activeBarbers,
                servicesCount
            ] = await Promise.all([
                // 1. Appointments Today
                pool.query(`
                    SELECT COUNT(*) as count 
                    FROM appointments 
                    WHERE DATE(scheduled_at) = CURRENT_DATE 
                    AND status != 'cancelado'
                `),
                // 2. Revenue Today (approximate based on completed services)
                pool.query(`
                    SELECT SUM(s.price) as revenue
                    FROM appointments a
                    JOIN services s ON a.service_id = s.id
                    WHERE DATE(a.scheduled_at) = CURRENT_DATE
                    AND a.status = 'finalizado'
                `),
                // 3. Active Barbers Count
                pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'barbeiro' AND is_active = true`),
                // 4. Services Count
                pool.query(`SELECT COUNT(*) as count FROM services WHERE is_active = true`)
            ]);

            const stats = {
                appointmentsToday: parseInt(dailyAppointments.rows[0].count),
                revenueToday: parseFloat(dailyAppointments.rows[0].revenue || '0'),
                activeBarbers: parseInt(activeBarbers.rows[0].count),
                activeServices: parseInt(servicesCount.rows[0].count),
                lastUpdated: new Date().toISOString()
            };

            res.json(stats);
        } catch (error) {
            logger.error('Error fetching dashboard stats', error);
            res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
        }
    }

    static async getRecentActivity(req: Request, res: Response) {
        try {
            const result = await pool.query(`
                SELECT 
                    a.id,
                    a.created_at,
                    a.status,
                    c.name as client_name,
                    s.name as service_name
                FROM appointments a
                JOIN users c ON a.client_id = c.id
                JOIN services s ON a.service_id = s.id
                ORDER BY a.created_at DESC
                LIMIT 5
            `);

            res.json({ activities: result.rows });
        } catch (error) {
            logger.error('Error fetching recent activity', error);
            res.status(500).json({ error: 'Failed to fetch recent activity' });
        }
    }
}
