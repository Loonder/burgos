import { Router } from 'express';
import { GamificationController } from '../controllers/gamification.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public leaderboard
router.get('/leaderboard', GamificationController.getLeaderboard);

// Barber stats (authenticated)
router.get('/barber/:id/stats', authenticate, GamificationController.getBarberStats);

// Admin recalculate
router.post('/recalculate', authenticate, authorize('admin'), GamificationController.recalculateAll);

export default router;
