import { Router } from 'express';
import { login, register, me, refreshAccessToken, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply strict rate limiting to auth endpoints
router.use(authLimiter);

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh', refreshAccessToken); // Cookie validation is inside controller for now or custom schema
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
