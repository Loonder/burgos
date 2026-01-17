import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { paymentService } from '../services/payment.service';
import { logger } from '../utils/logger';

export const getPlans = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('plans')
            .select('*, discounts:plan_discounts(service_id, is_free, discount_percentage)')
            .eq('is_active', true);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        logger.error('Error fetching plans', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getMySubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const subscription = await paymentService.getActiveSubscription(userId);
        res.json({ subscription });
    } catch (error) {
        logger.error('Error fetching my subscription', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { planId, successUrl, cancelUrl } = req.body;

        if (!planId) return res.status(400).json({ error: 'Plan ID required' });

        const session = await paymentService.subscribeUser(userId, planId, successUrl, cancelUrl);

        res.json(session);
    } catch (error) {
        logger.error('Error creating checkout', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const mockActivate = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { planId } = req.body;

        const sub = await paymentService.mockActivateSubscription(userId, planId);
        res.json({ success: true, subscription: sub });
    } catch (error) {
        logger.error('Error activating mock sub', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const checkPrice = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id; // Authenticated user
        const { serviceId, originalPrice } = req.body;

        if (!serviceId || originalPrice === undefined) {
            return res.status(400).json({ error: 'serviceId and originalPrice required' });
        }

        const result = await paymentService.checkPrice(userId, serviceId, Number(originalPrice));
        res.json(result);
    } catch (error) {
        logger.error('Error checking price', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
