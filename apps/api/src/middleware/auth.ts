import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
    throw new Error('❌ FATAL: JWT_SECRET environment variable is not defined.');
}

if (!JWT_REFRESH_SECRET) {
    throw new Error('❌ FATAL: JWT_REFRESH_SECRET environment variable is not defined.');
}

export interface AuthUser {
    id: string;
    email: string;
    role: 'cliente' | 'barbeiro' | 'recepcionista' | 'admin';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.access_token ||
            (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
                ? req.headers.authorization.substring(7)
                : null);

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

        req.user = decoded;
        next();
    } catch (error) {
        // Silent logger for expired token to avoid log spam, simply return 401
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            // Let the frontend handle the 401 and try refresh
        } else {
            logger.error('Authentication error:', error);
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

export const generateToken = (user: AuthUser): string => {
    const options: jwt.SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    };
    return jwt.sign(user, JWT_SECRET, options);
};

export const generateRefreshToken = (user: AuthUser): string => {
    // Already validated above
    const options: jwt.SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    };
    return jwt.sign(user, JWT_REFRESH_SECRET!, options);
};
