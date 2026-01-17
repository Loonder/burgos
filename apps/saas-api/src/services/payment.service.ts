import { supabase } from '../config/database';
import { logger } from '../utils/logger';

// Interface for Payment Provider
interface PaymentProvider {
    createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<{ url: string, sessionId: string }>;
    cancelSubscription(subscriptionId: string): Promise<boolean>;
}

// Mock Provider Implementation
class MockPaymentProvider implements PaymentProvider {
    async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
        logger.info(`[MockPayment] Creating checkout session for user ${userId} plan ${priceId}`);
        // Return a URL that hits our own API to simulate "success" callback from Stripe
        // In real life, Stripe redirects to successUrl.
        // For mock, we can just return the successUrl immediately, or a special debug page.
        // Let's return the successUrl but append a mock session_id.
        return {
            url: `${successUrl}?session_id=mock_session_${Date.now()}`,
            sessionId: `mock_session_${Date.now()}`
        };
    }

    async cancelSubscription(subscriptionId: string) {
        logger.info(`[MockPayment] Cancelling subscription ${subscriptionId}`);
        return true;
    }
}

// Service Wrapper
class PaymentService {
    private provider: PaymentProvider;

    constructor() {
        // Simple toggle. In future, check process.env.STRIPE_SECRET_KEY
        this.provider = new MockPaymentProvider();
    }

    async subscribeUser(userId: string, planId: string, successUrl: string, cancelUrl: string) {
        // 1. Get Plan details
        const { data: plan, error } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (error || !plan) throw new Error('Plan not found');

        // 2. Create Checkout
        const session = await this.provider.createCheckoutSession(userId, plan.stripe_price_id, successUrl, cancelUrl);

        return session;
    }

    // This usually comes from Webhook, but for Mock we might need a manual "activate" trigger
    // triggered by the frontend "success" page for demo purposes.
    async mockActivateSubscription(userId: string, planId: string) {
        const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single();
        if (!plan) throw new Error('Plan not found');

        // Create subscription record
        const { data, error } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan_id: planId,
                stripe_subscription_id: `sub_mock_${Date.now()}`,
                stripe_customer_id: `cus_mock_${userId}`,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getActiveSubscription(userId: string) {
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*, plan:plans(*)')
            .eq('user_id', userId)
            .in('status', ['active', 'trialing'])
            .single();

        if (error && error.code !== 'PGRST116') logger.error('Error fetching sub', error);
        return data;
    }

    // --- POS Payment Restoration ---
    async processPayment(paymentData: { appointmentId: string, amount: number, method: string }, userId: string) {
        logger.info('Processing POS payment', paymentData);

        // 1. Create Payment Record
        const { data: payment, error } = await supabase
            .from('payments')
            .insert({
                appointment_id: paymentData.appointmentId,
                amount: paymentData.amount,
                method: paymentData.method,
                status: 'confirmado', // Auto-confirm for POS
                confirmed_at: new Date().toISOString(),
                confirmed_by: userId
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Update Appointment Status?
        // The controller seems to emit 'appointment:updated' with status 'finalizado'.
        // Should we update the DB here? Ideally yes.
        await supabase
            .from('appointments')
            .update({ status: 'finalizado', finished_at: new Date().toISOString() })
            .eq('id', paymentData.appointmentId);

        return payment;
    }
    // --- Discount Logic ---
    async checkPrice(userId: string, serviceId: string, originalPrice: number) {
        // 1. Get Active Subscription with Plan & Discounts
        const { data: sub, error } = await supabase
            .from('user_subscriptions')
            .select(`
                status,
                plan:plans (
                    id,
                    discounts:plan_discounts (
                        service_id,
                        is_free,
                        discount_percentage
                    )
                )
            `)
            .eq('user_id', userId)
            .in('status', ['active', 'trialing'])
            .single();

        // If no sub, return full price
        if (error || !sub || !sub.plan) {
            return { finalPrice: originalPrice, isDiscounted: false };
        }

        // 2. Check for discount match
        // Type assertion needed because supabase join types are tricky
        const discounts = (sub.plan as any).discounts || [];
        const discount = discounts.find((d: any) => d.service_id === serviceId);

        if (!discount) {
            return { finalPrice: originalPrice, isDiscounted: false };
        }

        // 3. Calculate
        if (discount.is_free) {
            return { finalPrice: 0, isDiscounted: true, discountType: 'free' };
        }

        const percentage = discount.discount_percentage || 0;
        const finalPrice = originalPrice - (originalPrice * (percentage / 100));

        return {
            finalPrice: Math.max(0, finalPrice),
            isDiscounted: true,
            discountType: 'percentage',
            percentage
        };
    }
}

export const paymentService = new PaymentService();
