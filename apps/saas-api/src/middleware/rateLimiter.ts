import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 10 login/register requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many login attempts, please try again after 15 minutes',
    },
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300, // Limit each IP to 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later',
    },
});
