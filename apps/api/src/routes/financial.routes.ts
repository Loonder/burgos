import { Router } from 'express';
import { FinancialController } from '../controllers/financial.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All financial routes require admin
router.use(authenticate);
router.use(authorize('admin'));

router.get('/summary', FinancialController.getSummary);
router.get('/transactions', FinancialController.getTransactions);
router.post('/transactions', FinancialController.createTransaction);
router.get('/by-barber', FinancialController.getByBarber);
router.get('/by-payment-method', FinancialController.getByPaymentMethod);

export default router;
