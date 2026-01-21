import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // 1. Log the error
    logger.error('Error caught in global handler:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });

    // 2. Handle known errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: err.errors,
        });
    }

    // 3. Handle unknown errors (Production vs Dev)
    // Avoid leaking stack traces in production
    const isProd = process.env.NODE_ENV === 'production';

    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        ...(isProd ? {} : { stack: err.stack }),
    });
};
