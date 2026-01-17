import { Router } from 'express';
import * as SubscriptionController from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public (or authenticated?) - Plans listing could be public
router.get('/plans', SubscriptionController.getPlans);

// Protected
router.use(authenticate);
router.get('/me', SubscriptionController.getMySubscription);
router.post('/checkout', SubscriptionController.createCheckoutSession);
router.post('/check-price', SubscriptionController.checkPrice);
router.post('/mock-activate', SubscriptionController.mockActivate);

export default router;
