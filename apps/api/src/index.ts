import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import serviceRoutes from './routes/service.routes';
import barberRoutes from './routes/barber.routes';
import preferenceRoutes from './routes/preference.routes';
import spotifyRoutes from './routes/spotify.routes';
import dashboardRoutes from './routes/dashboard.routes';
import clientRoutes from './routes/client.routes';
import paymentRoutes from './routes/payment.routes';
import crmRoutes from './routes/crm.routes';
import subscriptionRoutes from './routes/subscription.routes';
import adminPlanRoutes from './routes/admin-plan.routes';
import adminSubscriptionRoutes from './routes/admin-subscription.routes';
import productRoutes from './routes/product.routes';
import financialRoutes from './routes/financial.routes';
import exportRoutes from './routes/export.routes';
import gamificationRoutes from './routes/gamification.routes';
import missionsRoutes from './routes/missions.routes';

// Load environment variables from monorepo root
// Environment variables are loaded by config/database.ts

const app = express();
const httpServer = createServer(app);

/**
 * ✅ ORIGENS PERMITIDAS (DEV + PROD)
 */
const allowedOrigins = [
    'https://burgos.paulomoraes.cloud',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3030',
];

/**
 * 🔌 SOCKET.IO
 */
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

/**
 * 🛡️ MIDDLEWARES GLOBAIS
 */
app.use(helmet());

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// Preflight (OPTIONS) — OBRIGATÓRIO PARA BROWSER
app.options('*', cors());

// ... imports
import { apiLimiter } from './middleware/rateLimiter';

app.use(compression());
app.use(cookieParser()); // Enable cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiting
app.use(apiLimiter);

/**
 * ❤️ HEALTH CHECK
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

/**
 * 🚀 API ROUTES
 */
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin/plans', adminPlanRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/missions', missionsRoutes); // Added missionsRoutes to API routes

app.get('/api', (req, res) => {
    res.json({
        name: 'Burgos Experience System API',
        version: '1.0.0',
        status: 'running',
    });
});

import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);

/**
 * 🔁 WEBSOCKET
 */
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Export io for other modules
export { io };

/**
 * ▶️ START SERVER
 */
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    logger.info(`🚀 API Server running on port ${PORT}`);
    logger.info(`🔌 WebSocket server ready`);
    logger.info(`📡 Health check: https://api.burgos.paulomoraes.cloud/health`);
});

export default app;
