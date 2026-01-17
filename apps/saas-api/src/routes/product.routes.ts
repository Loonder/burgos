import { Router } from 'express';
import { ProductController, AdminProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', ProductController.listProducts);
router.get('/:id', ProductController.getProduct);

// Admin routes
router.use('/admin', authenticate, authorize('admin'));
router.get('/admin', AdminProductController.listAll);
router.post('/admin', AdminProductController.create);
router.put('/admin/:id', AdminProductController.update);
router.delete('/admin/:id', AdminProductController.delete);
router.post('/admin/:id/link-service', AdminProductController.linkToService);

export default router;
