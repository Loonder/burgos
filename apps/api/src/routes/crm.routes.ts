import { Router } from 'express';
import { getCRMAlerts } from '../controllers/crm.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/alerts', authenticate, getCRMAlerts);

export default router;
