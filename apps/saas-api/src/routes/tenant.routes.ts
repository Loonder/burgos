import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, TenantController.getMe);
router.get('/public/:slug', TenantController.getPublic);
router.put('/me/branding', authenticate, TenantController.updateBranding);

export default router;
