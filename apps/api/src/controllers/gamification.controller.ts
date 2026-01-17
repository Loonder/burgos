import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

// Badge definitions
const BADGES = {
    FIRST_BLOOD: { id: 'first_blood', name: 'Primeiro Corte', description: 'Completou o primeiro atendimento', icon: '🎯' },
    CENTURY: { id: 'century', name: 'Centurião', description: '100 atendimentos completados', icon: '💯' },
    THOUSAND: { id: 'thousand', name: 'Lendário', description: '1000 atendimentos completados', icon: '🏆' },
    STREAK_7: { id: 'streak_7', name: 'Semana de Fogo', description: '7 dias seguidos trabalhando', icon: '🔥' },
    STREAK_30: { id: 'streak_30', name: 'Mês Imbatível', description: '30 dias seguidos trabalhando', icon: '⚡' },
    TOP_RATED: { id: 'top_rated', name: 'Favorito', description: 'Avaliação média acima de 4.5', icon: '⭐' },
    HIGH_EARNER: { id: 'high_earner', name: 'Bolso Cheio', description: 'R$10.000+ em um mês', icon: '💰' },
};

export class GamificationController {

    // GET /api/gamification/leaderboard
    static async getLeaderboard(req: Request, res: Response) {
        try {
            const { period } = req.query; // 'week', 'month', 'all'

            // Calculate date range
            let startDate = new Date();
            if (period === 'week') {
                startDate.setDate(startDate.getDate() - 7);
            } else if (period === 'month') {
                startDate.setMonth(startDate.getMonth() - 1);
            } else {
                startDate = new Date(0); // All time
            }

            // Get barbers with stats
            const { data: barbers } = await supabase
                .from('users')
                .select('id, name, avatar_url')
                .eq('role', 'barbeiro')
                .eq('is_active', true);

            // Get appointments per barber
            const { data: appointments } = await supabase
                .from('appointments')
                .select('barber_id, status')
                .eq('status', 'completed')
                .gte('start_time', startDate.toISOString());

            // Get transactions per barber
            const { data: transactions } = await supabase
                .from('transactions')
                .select('barber_id, amount')
                .eq('type', 'income')
                .not('barber_id', 'is', null)
                .gte('created_at', startDate.toISOString());

            // Calculate stats
            const leaderboard = barbers?.map(barber => {
                const barberAppointments = appointments?.filter(a => a.barber_id === barber.id) || [];
                const barberTransactions = transactions?.filter(t => t.barber_id === barber.id) || [];
                const totalRevenue = barberTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

                return {
                    barber_id: barber.id,
                    name: barber.name,
                    avatar_url: barber.avatar_url,
                    appointments_count: barberAppointments.length,
                    total_revenue: totalRevenue,
                    // Score formula: appointments * 10 + revenue / 100
                    score: (barberAppointments.length * 10) + Math.floor(totalRevenue / 100)
                };
            }).sort((a, b) => b.score - a.score) || [];

            // Add rank
            const ranked = leaderboard.map((b, i) => ({ ...b, rank: i + 1 }));

            res.json({ data: ranked, period: period || 'all' });
        } catch (error) {
            logger.error('Get Leaderboard Error', error);
            res.status(500).json({ error: 'Erro ao buscar ranking' });
        }
    }

    // GET /api/gamification/barber/:id/stats
    static async getBarberStats(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Get or create barber stats
            let { data: stats, error } = await supabase
                .from('barber_stats')
                .select('*')
                .eq('barber_id', id)
                .single();

            if (error && error.code === 'PGRST116') {
                // No stats yet, calculate from scratch
                const { count: totalAppointments } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('barber_id', id)
                    .eq('status', 'completed');

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount')
                    .eq('barber_id', id)
                    .eq('type', 'income');

                const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

                // Create stats
                const { data: newStats } = await supabase
                    .from('barber_stats')
                    .insert({
                        barber_id: id,
                        total_appointments: totalAppointments || 0,
                        total_revenue: totalRevenue,
                        badges: []
                    })
                    .select()
                    .single();

                stats = newStats;
            }

            // Calculate badges
            const earnedBadges = [];
            if (stats?.total_appointments >= 1) earnedBadges.push(BADGES.FIRST_BLOOD);
            if (stats?.total_appointments >= 100) earnedBadges.push(BADGES.CENTURY);
            if (stats?.total_appointments >= 1000) earnedBadges.push(BADGES.THOUSAND);
            if (stats?.streak_days >= 7) earnedBadges.push(BADGES.STREAK_7);
            if (stats?.streak_days >= 30) earnedBadges.push(BADGES.STREAK_30);
            if (stats?.avg_rating >= 4.5) earnedBadges.push(BADGES.TOP_RATED);

            res.json({
                stats,
                badges: earnedBadges,
                availableBadges: Object.values(BADGES)
            });
        } catch (error) {
            logger.error('Get Barber Stats Error', error);
            res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
    }

    // POST /api/gamification/recalculate (Admin only)
    static async recalculateAll(req: Request, res: Response) {
        try {
            // Get all barbers
            const { data: barbers } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'barbeiro');

            for (const barber of barbers || []) {
                const { count: totalAppointments } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('barber_id', barber.id)
                    .eq('status', 'completed');

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount')
                    .eq('barber_id', barber.id)
                    .eq('type', 'income');

                const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

                await supabase
                    .from('barber_stats')
                    .upsert({
                        barber_id: barber.id,
                        total_appointments: totalAppointments || 0,
                        total_revenue: totalRevenue,
                        updated_at: new Date().toISOString()
                    });
            }

            res.json({ success: true, message: `Recalculated stats for ${barbers?.length || 0} barbers` });
        } catch (error) {
            logger.error('Recalculate Stats Error', error);
            res.status(500).json({ error: 'Erro ao recalcular estatísticas' });
        }
    }
}
