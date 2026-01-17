import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class SubscriptionController {

    // Public: List all available plans
    static async getPlans(req: Request, res: Response) {
        try {
            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .eq('is_active', true)
                .order('price_monthly');

            if (error) throw error;
            res.json({ data });
        } catch (error) {
            logger.error('Error fetching plans', error);
            res.status(500).json({ error: 'Failed to fetch plans' });
        }
    }

    // Protected: Get current tenant's subscription
    static async getMySubscription(req: Request, res: Response) {
        try {
            // In a real implementation, we get tenant_id from the user's session or header
            // For MVP/Demo, let's assume it's passed or we use the 'burgos' default for now if not found
            // const tenantId = req.headers['x-tenant-id']; 

            // Getting the tenant of the current user
            const { id: userId } = req.user as any;
            const { data: user } = await supabase.from('users').select('tenant_id').eq('id', userId).single();

            if (!user?.tenant_id) {
                return res.status(404).json({ error: 'Tenant not found for user' });
            }

            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    plan:plans(*)
                `)
                .eq('tenant_id', user.tenant_id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = JSON not found (no sub yet)

            res.json({ data: data || null });
        } catch (error) {
            logger.error('Error fetching subscription', error);
            res.status(500).json({ error: 'Failed to fetch subscription' });
        }
    }

    // Admin/Owner: Change Plan (Mock Stripe)
    static async changePlan(req: Request, res: Response) {
        try {
            const { planSlug } = req.body;
            const { id: userId } = req.user as any;

            // Resolve Tenant
            const { data: user } = await supabase.from('users').select('tenant_id').eq('id', userId).single();
            if (!user?.tenant_id) return res.status(400).json({ error: 'User has no tenant' });
            const tenantId = user.tenant_id;

            // Find Plan
            const { data: plan } = await supabase.from('plans').select('*').eq('slug', planSlug).single();
            if (!plan) return res.status(404).json({ error: 'Plan not found' });

            // Update Tenant "plan_tier" (denormalized for fast access) and Subscription table

            // 1. Update Subscription Table (Upsert)
            const { error: subError } = await supabase
                .from('subscriptions')
                .upsert({
                    tenant_id: tenantId,
                    plan_id: plan.id,
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // +30 days
                }, { onConflict: 'tenant_id' });

            if (subError) throw subError;

            // 2. Update Tenant Plan Tier (The Gatekeeper)
            await supabase
                .from('tenants')
                .update({ plan_tier: plan.slug })
                .eq('id', tenantId);

            res.json({ message: `Successfully upgraded to ${plan.name}`, plan });
        } catch (error) {
            logger.error('Error changing plan', error);
            res.status(500).json({ error: 'Failed to change plan' });
        }
    }
}
