import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public
router.get('/plans', SubscriptionController.getPlans);

// Protected (Requires Login)
router.get('/me', authenticate, SubscriptionController.getMySubscription);
router.post('/change-plan', authenticate, SubscriptionController.changePlan);

export default router;
