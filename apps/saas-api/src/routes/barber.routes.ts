import { Router } from 'express';
import { BarberController } from '../controllers/barber.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * =========================
 * ROTAS PÚBLICAS (AGENDAMENTO)
 * =========================
 */

// Listar barbeiros (público)
router.get('/', BarberController.listBarbers);

// Horários disponíveis de um barbeiro (público)
router.get('/:id/available-slots', BarberController.getAvailableSlots);

// Visualizar agenda de um barbeiro (público – somente leitura)
router.get('/:id/schedule', BarberController.getSchedule);

/**
 * =========================
 * ROTAS PROTEGIDAS (ADMIN)
 * =========================
 */

// Criar barbeiro
router.post(
    '/',
    authenticate,
    authorize('admin'),
    BarberController.createBarber
);

// Atualizar dados do barbeiro
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    BarberController.updateBarber
);

// Atualizar agenda (admin / recepcionista / barbeiro)
router.put(
    '/:id/schedule',
    authenticate,
    authorize('admin', 'recepcionista', 'barbeiro'),
    BarberController.updateSchedule
);

// Deletar barbeiro
router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    BarberController.deleteBarber
);

export default router;
