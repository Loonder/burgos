import { Router } from 'express';
import { ProductController, AdminProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin routes FIRST (more specific)
router.get('/admin', authenticate, authorize('admin'), AdminProductController.listAll);
router.post('/admin', authenticate, authorize('admin'), AdminProductController.create);
router.put('/admin/:id', authenticate, authorize('admin'), AdminProductController.update);
router.delete('/admin/:id', authenticate, authorize('admin'), AdminProductController.delete);
router.post('/admin/:id/link-service', authenticate, authorize('admin'), AdminProductController.linkToService);

// Public routes (less specific)
router.get('/', ProductController.listProducts);
router.get('/:id', ProductController.getProduct);

export default router;

