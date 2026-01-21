import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class AdminPlanController {

    // GET /api/admin/plans (Include inactive?)
    static async listPlans(req: Request, res: Response) {
        try {
            const { data, error } = await supabase
                .from('plans')
                .select('*, discounts:plan_discounts(service_id, is_free, discount_percentage)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json({ data });
        } catch (error) {
            logger.error('Admin List Plans Error', error);
            res.status(500).json({ error: 'Erro ao listar planos' });
        }
    }

    // POST /api/admin/plans
    static async createPlan(req: Request, res: Response) {
        try {
            const { name, description, price, stripe_price_id, discounts } = req.body;
            // discounts: [{ service_id, is_free, discount_percentage }]

            // 1. Create Plan
            const { data: plan, error: planError } = await supabase
                .from('plans')
                .insert({
                    name,
                    description,
                    price,
                    stripe_price_id: stripe_price_id || `price_mock_${Date.now()}` // Auto-mock if missing
                })
                .select()
                .single();

            if (planError) throw planError;

            // 2. Create Discounts
            if (discounts && discounts.length > 0) {
                const discountInserts = discounts.map((d: any) => ({
                    plan_id: plan.id,
                    service_id: d.service_id,
                    is_free: d.is_free,
                    discount_percentage: d.discount_percentage
                }));

                const { error: discError } = await supabase
                    .from('plan_discounts')
                    .insert(discountInserts);

                if (discError) {
                    // Rollback manually? Supabase doesn't support easy transaction rollback via client lib unless RPC.
                    // For now, allow partial failure or delete plan.
                    await supabase.from('plans').delete().eq('id', plan.id);
                    throw discError;
                }
            }

            res.status(201).json({ success: true, plan });
        } catch (error) {
            logger.error('Admin Create Plan Error', error);
            res.status(500).json({ error: 'Erro ao criar plano' });
        }
    }

    // PUT /api/admin/plans/:id
    static async updatePlan(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, price, discounts } = req.body;

            // 1. Update Plan
            const { error: planError } = await supabase
                .from('plans')
                .update({ name, description, price })
                .eq('id', id);

            if (planError) throw planError;

            // 2. Update Discounts (Full Replace Strategy)
            if (discounts) {
                // Delete old
                await supabase.from('plan_discounts').delete().eq('plan_id', id);

                // Insert new
                if (discounts.length > 0) {
                    const discountInserts = discounts.map((d: any) => ({
                        plan_id: id,
                        service_id: d.service_id,
                        is_free: d.is_free,
                        discount_percentage: d.discount_percentage
                    }));

                    const { error: discError } = await supabase
                        .from('plan_discounts')
                        .insert(discountInserts);

                    if (discError) throw discError;
                }
            }

            res.json({ success: true });
        } catch (error) {
            logger.error('Admin Update Plan Error', error);
            res.status(500).json({ error: 'Erro ao atualizar plano' });
        }
    }

    // DELETE /api/admin/plans/:id
    static async deletePlan(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('plans').delete().eq('id', id);

            if (error) throw error;
            res.json({ success: true });
        } catch (error) {
            logger.error('Admin Delete Plan Error', error);
            res.status(500).json({ error: 'Erro ao deletar plano' });
        }
    }

    // GET /api/admin/plans/subscribers
    static async listSubscribers(req: Request, res: Response) {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select(`
                    *,
                    user:users(id, name, email),
                    plan:plans(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json({ data });
        } catch (error) {
            logger.error('Admin List Subscribers Error', error);
            res.status(500).json({ error: 'Erro ao listar assinantes' });
        }
    }

    // POST /api/admin/subscriptions
    static async createSubscription(req: Request, res: Response) {
        try {
            const { user_id, plan_id, status, days } = req.body;

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (days || 30));

            const { data, error } = await supabase
                .from('user_subscriptions')
                .insert({
                    user_id,
                    plan_id,
                    status: status || 'active',
                    current_period_start: startDate.toISOString(),
                    current_period_end: endDate.toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ data });
        } catch (error) {
            logger.error('Admin Create Subscription Error', error);
            res.status(500).json({ error: 'Erro ao criar assinatura' });
        }
    }

    // PUT /api/admin/subscriptions/:id
    static async updateSubscription(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, plan_id } = req.body;

            const updateData: any = {};
            if (status) updateData.status = status;
            if (plan_id) updateData.plan_id = plan_id;

            const { data, error } = await supabase
                .from('user_subscriptions')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            res.json({ data });
        } catch (error) {
            logger.error('Admin Update Subscription Error', error);
            res.status(500).json({ error: 'Erro ao atualizar assinatura' });
        }
    }

    // DELETE /api/admin/subscriptions/:id
    static async deleteSubscription(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const { error } = await supabase
                .from('user_subscriptions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.status(204).send();
        } catch (error) {
            logger.error('Admin Delete Subscription Error', error);
            res.status(500).json({ error: 'Erro ao remover assinatura' });
        }
    }
}
