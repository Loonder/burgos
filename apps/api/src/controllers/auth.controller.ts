import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../config/database';
import { generateToken, generateRefreshToken, AuthUser } from '../middleware/auth';
import { logger } from '../utils/logger';


const NODE_ENV = process.env.NODE_ENV || 'development';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Get user from Supabase
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, password_hash, name, role, avatar_url')
            .eq('email', email)
            .eq('is_active', true)
            .limit(1);

        if (error || !users || users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateToken(authUser);
        const refreshToken = generateRefreshToken(authUser);

        setAuthCookies(res, accessToken, refreshToken);

        logger.info(`User logged in: ${user.email}`);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
            },
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ message: 'Logged out successfully' });
};


export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, phone } = req.body;
        const role = 'cliente'; // FORCE ROLE to always be 'cliente' on public registration

        // Check if user exists
        const { data: existingUsers } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1);

        if (existingUsers && existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const { data: newUsers, error } = await supabase
            .from('users')
            .insert([{
                email,
                password_hash: passwordHash,
                name,
                phone,
                role,
                birth_date: req.body.birthDate,
            }])
            .select('id, email, name, role');

        if (error || !newUsers || newUsers.length === 0) {
            logger.error('Registration error:', error);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        const newUser = newUsers[0];

        logger.info(`New user registered: ${newUser.email}`);

        res.status(201).json({
            user: newUser,
            message: 'User created successfully',
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, name, phone, role, avatar_url, created_at')
            .eq('id', req.user.id)
            .limit(1);

        if (error || !users || users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const refresh_token = req.cookies.refresh_token;

        if (!refresh_token) {
            return res.status(401).json({ error: 'Refresh token is required' });
        }

        const jwt = require('jsonwebtoken');
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

        const decoded = jwt.verify(refresh_token, refreshSecret) as AuthUser;

        const accessToken = generateToken({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        });

        // Optionally rotate refresh token here if needed

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: 'Token refreshed' });
    } catch (error) {
        logger.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

import { emailService } from '../services/email.service';
import crypto from 'crypto';

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // 1. Check if user exists
        const { data: users } = await supabase
            .from('users')
            .select('id, name')
            .eq('email', email)
            .limit(1);

        if (!users || users.length === 0) {
            // Silence security implies we shouldn't reveal if user exists or not, 
            // but for good UX in this app context, let's just return success or generic msg
            return res.status(200).json({ message: 'If email exists, a reset link was sent.' });
        }

        const user = users[0];

        // 2. Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // 3. Save to DB
        const { error } = await supabase
            .from('password_reset_tokens')
            .insert({
                user_id: user.id,
                token: token, // In prod, hash this too! But simplified for now
                expires_at: expiresAt,
            });

        if (error) throw error;

        // 4. Send Email
        await emailService.sendPasswordResetEmail(email, token);

        res.status(200).json({ message: 'If email exists, a reset link was sent.' });
    } catch (error) {
        logger.error('Forgot password error:', error);
        // Generic error to prevent leakage
        res.status(500).json({ error: 'Failed to process request' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        // 1. Find valid token
        const { data: tokens, error: tokenError } = await supabase
            .from('password_reset_tokens')
            .select('user_id, expires_at, used')
            .eq('token', token)
            .is('used', false)
            .gt('expires_at', new Date().toISOString())
            .limit(1);

        if (tokenError || !tokens || tokens.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const resetToken = tokens[0];

        // 2. Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Update User Password
        const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', resetToken.user_id);

        if (updateError) throw updateError;

        // 4. Mark token as used
        await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('token', token);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        logger.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
