import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All export routes require admin
router.use(authenticate);
router.use(authorize('admin'));

router.get('/clients', ExportController.exportClients);
router.get('/appointments', ExportController.exportAppointments);
router.get('/transactions', ExportController.exportTransactions);
router.get('/products', ExportController.exportProducts);

export default router;
