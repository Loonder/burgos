import { z } from 'zod';

export const createBarberSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Nome muito curto'),
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        phone: z.string().optional(),
        commission_rate: z.number().min(0).max(100).optional(),
    }),
});

export const updateBarberSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        commission_rate: z.number().min(0).max(100).optional(),
        // Password update is usually handled separately, but supporting it here for simplicity
        password: z.string().min(6).optional(),
    }),
});

export const updateScheduleSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        schedule: z.array(z.object({
            day_of_week: z.number().min(0).max(6),
            start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM necessário'),
            end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM necessário'),
            is_active: z.boolean().optional(),
        })),
    }),
});
