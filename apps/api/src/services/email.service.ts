import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

class EmailService {
    private transporter;

    constructor() {
        // Defaults to Ethereal if not configured, or fails gently
        if (!process.env.SMTP_HOST) {
            logger.warn('SMTP_HOST not set. EmailService disabled.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        if (!this.transporter) {
            logger.warn(`EmailService not ready. Would send reset token ${token} to ${to}`);
            return false;
        }

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        try {
            const info = await this.transporter.sendMail({
                from: '"Burgos Barbearia" <noreply@burgos.paulomoraes.cloud>',
                to,
                subject: 'Recuperação de Senha - Burgos Barbearia',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2>Recuperação de Senha</h2>
                        <p>Você solicitou a redefinição de sua senha.</p>
                        <p>Clique no link abaixo para criar uma nova senha:</p>
                        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #d4af37; color: #000; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
                        <p>Este link é válido por 1 hora.</p>
                        <p>Se você não solicitou isso, ignore este e-mail.</p>
                    </div>
                `,
            });

            logger.info(`Password reset email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            logger.error('Error sending email', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
