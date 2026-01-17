import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

router.post('/', PaymentController.createPayment);

export default router;
