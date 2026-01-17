import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class MissionsController {

    // GET /api/missions (Admin: list all, Barber: list active)
    static async listMissions(req: Request, res: Response) {
        try {
            const userRole = req.user?.role;
            const user = req.user?.id;

            let query = supabase.from('missions').select('*');

            if (userRole === 'barbeiro') {
                // Barbers see active missions
                query = query.eq('is_active', true);
            }
            // Admin sees all

            const { data: missions, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            // If barber, check progress for each
            if (userRole === 'barbeiro') {
                const { data: progress } = await supabase
                    .from('barber_missions')
                    .select('*')
                    .eq('barber_id', user);

                const missionsWithProgress = missions?.map(m => {
                    const prog = progress?.find(p => p.mission_id === m.id);
                    return {
                        ...m,
                        current_value: prog?.current_value || 0,
                        is_completed: prog?.is_completed || false,
                        completed_at: prog?.completed_at
                    };
                });
                return res.json({ data: missionsWithProgress });
            }

            res.json({ data: missions });
        } catch (error) {
            logger.error('List Missions Error', error);
            res.status(500).json({ error: 'Erro ao listar missões' });
        }
    }

    // POST /api/missions (Admin only)
    static async createMission(req: Request, res: Response) {
        try {
            const { title, description, type, target_value, reward_type, reward_value, start_date, end_date } = req.body;

            const { data, error } = await supabase
                .from('missions')
                .insert({
                    title,
                    description,
                    type,
                    target_value,
                    reward_type,
                    reward_value,
                    start_date,
                    end_date
                })
                .select()
                .single();

            if (error) throw error;

            res.status(201).json({ message: 'Missão criada', data });
        } catch (error) {
            logger.error('Create Mission Error', error);
            res.status(500).json({ error: 'Erro ao criar missão' });
        }
    }

    // POST /api/missions/:id/join (Barber joins a mission if not auto)
    // For now, let's assume all barbers are auto-enrolled in active missions for simplicity?
    // Or we can manually track progress.
    // Let's create a Helper to "Update Progress" that is called by triggers (like Appointment Finish)

    // This endpoint acts as a manual "Check My Progress" or "Sync"
    static async checkProgress(req: Request, res: Response) {
        // ... Logic to recalculate progress based on mission type ...
        // This is complex. For MVP "War", let's focus on simple display first.
        res.json({ message: 'Sync not implemented yet' });
    }
}
