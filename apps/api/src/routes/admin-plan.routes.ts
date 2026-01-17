import { Router } from 'express';
import { AdminPlanController } from '../controllers/admin-plan.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', AdminPlanController.listPlans);
router.get('/subscribers', AdminPlanController.listSubscribers);
router.post('/', AdminPlanController.createPlan);
router.put('/:id', AdminPlanController.updatePlan);
router.delete('/:id', AdminPlanController.deletePlan);

export default router;
