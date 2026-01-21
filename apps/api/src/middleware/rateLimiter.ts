import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100, // Increased for testing (was 5)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts, please try again after 15 minutes',
    },
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100, // 100 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later',
    },
});
