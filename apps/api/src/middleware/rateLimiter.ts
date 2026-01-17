import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000, // Relaxed for dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts, please try again after 15 minutes',
    },
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10000, // Relaxed for dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later',
    },
});
