import { Router } from 'express';
import * as AppointmentController from '../controllers/appointment.controller';
import { CheckinController } from '../controllers/checkin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

import { validate } from '../middleware/validate';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/appointment.schema';

// All endpoints require authentication
router.use(authenticate);

router.post('/', validate(createAppointmentSchema), AppointmentController.createAppointment);
router.get('/', AppointmentController.getAppointments);
router.get('/:id', AppointmentController.getAppointmentById);
router.put('/:id', validate(updateAppointmentSchema), AppointmentController.updateAppointment);
router.delete('/:id', AppointmentController.cancelAppointment);
router.post('/checkin', CheckinController.checkin);

export default router;
