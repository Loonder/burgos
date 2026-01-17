import { Router } from 'express';
import { MissionsController } from '../controllers/missions.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Public (for Auth users)
router.get('/', MissionsController.listMissions);

// Admin Only
router.post('/', authorize('admin'), MissionsController.createMission);

export default router;
