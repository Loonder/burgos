import { Router } from 'express';
import * as AppointmentController from '../controllers/appointment.controller';
import { CheckinController } from '../controllers/checkin.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// router.use(authenticate); // Protect all routes
// Actually, I will explicitly add it to each route or uncomment line 8.
router.use(authenticate); // Protect all routes

router.post('/', AppointmentController.createAppointment);
router.get('/', AppointmentController.getAppointments);
router.get('/:id', AppointmentController.getAppointmentById);
router.put('/:id', AppointmentController.updateAppointment);
router.delete('/:id', AppointmentController.cancelAppointment);
// router.post('/:id/check-in', AppointmentController.checkInAppointment);
router.post('/checkin', CheckinController.checkin);

export default router;
