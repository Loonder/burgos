import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

import { validate } from '../middleware/validate';
import { createServiceSchema, updateServiceSchema } from '../schemas/service.schema';

router.get('/', ServiceController.getServices); // Public (for booking)
router.post('/', authenticate, authorize('admin'), validate(createServiceSchema), ServiceController.createService);
router.put('/:id', authenticate, authorize('admin'), validate(updateServiceSchema), ServiceController.updateService);
router.delete('/:id', authenticate, authorize('admin'), ServiceController.deleteService);

export default router;
