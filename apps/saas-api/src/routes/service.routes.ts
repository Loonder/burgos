import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', ServiceController.getServices); // Public (for booking)
router.post('/', authenticate, authorize('admin'), ServiceController.createService);
router.put('/:id', authenticate, authorize('admin'), ServiceController.updateService);
router.delete('/:id', authenticate, authorize('admin'), ServiceController.deleteService);

export default router;
