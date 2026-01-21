import { Router } from 'express';
import { getCRMAlerts } from '../controllers/crm.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Staff only - require authentication
router.get('/alerts', authenticate, authorize('admin', 'barbeiro', 'recepcionista'), getCRMAlerts);

export default router;
