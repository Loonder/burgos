import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        phone: z.string().optional(),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email().nonempty('Email é obrigatório'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().nonempty('Token é obrigatório'),
        password: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
    }),
});
