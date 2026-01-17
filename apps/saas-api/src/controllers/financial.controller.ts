import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class FinancialController {

    // GET /api/financial/summary
    static async getSummary(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1)); // First day of month
            const end = endDate ? new Date(endDate as string) : new Date();

            // Get all income transactions
            const { data: income } = await supabase
                .from('transactions')
                .select('amount')
                .eq('type', 'income')
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            // Get all expense transactions
            const { data: expenses } = await supabase
                .from('transactions')
                .select('amount')
                .eq('type', 'expense')
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            // Get appointments count
            const { count: appointmentsCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            const totalIncome = income?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
            const totalExpenses = expenses?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
            const ticketMedio = appointmentsCount && appointmentsCount > 0 ? totalIncome / appointmentsCount : 0;

            res.json({
                period: { start, end },
                totalIncome,
                totalExpenses,
                balance: totalIncome - totalExpenses,
                appointmentsCount: appointmentsCount || 0,
                ticketMedio
            });
        } catch (error) {
            logger.error('Financial Summary Error', error);
            res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
        }
    }

    // GET /api/financial/transactions
    static async getTransactions(req: Request, res: Response) {
        try {
            const { startDate, endDate, type, limit = 50 } = req.query;

            let query = supabase
                .from('transactions')
                .select(`
                    *,
                    barber:users!barber_id(name)
                `)
                .order('created_at', { ascending: false })
                .limit(Number(limit));

            if (startDate) query = query.gte('created_at', new Date(startDate as string).toISOString());
            if (endDate) query = query.lte('created_at', new Date(endDate as string).toISOString());
            if (type) query = query.eq('type', type);

            const { data, error } = await query;
            if (error) throw error;

            res.json({ data });
        } catch (error) {
            logger.error('Get Transactions Error', error);
            res.status(500).json({ error: 'Erro ao buscar transações' });
        }
    }

    // POST /api/financial/transactions
    static async createTransaction(req: Request, res: Response) {
        try {
            const { type, category, amount, payment_method, description, barber_id, reference_id } = req.body;
            const created_by = req.user?.id;

            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    type,
                    category,
                    amount,
                    payment_method,
                    description,
                    barber_id,
                    reference_id,
                    created_by
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, data });
        } catch (error) {
            logger.error('Create Transaction Error', error);
            res.status(500).json({ error: 'Erro ao criar transação' });
        }
    }

    // GET /api/financial/by-barber
    static async getByBarber(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1));
            const end = endDate ? new Date(endDate as string) : new Date();

            // Get barbers
            const { data: barbers } = await supabase
                .from('users')
                .select('id, name')
                .eq('role', 'barbeiro')
                .eq('is_active', true);

            // Get transactions grouped by barber
            const { data: transactions } = await supabase
                .from('transactions')
                .select('barber_id, amount')
                .eq('type', 'income')
                .not('barber_id', 'is', null)
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            // Calculate per barber
            const barberStats = barbers?.map(barber => {
                const barberTransactions = transactions?.filter(t => t.barber_id === barber.id) || [];
                const total = barberTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                const count = barberTransactions.length;
                return {
                    barber_id: barber.id,
                    barber_name: barber.name,
                    total_revenue: total,
                    appointments_count: count,
                    commission: total * 0.4 // 40% default commission
                };
            });

            res.json({ data: barberStats, period: { start, end } });
        } catch (error) {
            logger.error('Get By Barber Error', error);
            res.status(500).json({ error: 'Erro ao buscar por barbeiro' });
        }
    }

    // GET /api/financial/by-payment-method
    static async getByPaymentMethod(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1));
            const end = endDate ? new Date(endDate as string) : new Date();

            const { data: transactions } = await supabase
                .from('transactions')
                .select('payment_method, amount')
                .eq('type', 'income')
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            // Group by payment method
            const grouped: Record<string, number> = {};
            transactions?.forEach(t => {
                const method = t.payment_method || 'outros';
                grouped[method] = (grouped[method] || 0) + (t.amount || 0);
            });

            res.json({
                data: Object.entries(grouped).map(([method, total]) => ({ method, total })),
                period: { start, end }
            });
        } catch (error) {
            logger.error('Get By Payment Method Error', error);
            res.status(500).json({ error: 'Erro ao buscar por forma de pagamento' });
        }
    }
}
