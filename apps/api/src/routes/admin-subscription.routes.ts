import { Router } from 'express';
import { AdminPlanController } from '../controllers/admin-plan.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', AdminPlanController.createSubscription);
router.put('/:id', AdminPlanController.updateSubscription);
router.delete('/:id', AdminPlanController.deleteSubscription);

export default router;
