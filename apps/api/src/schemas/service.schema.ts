import { z } from 'zod';

export const createServiceSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Nome muito curto'),
        description: z.string().optional(),
        duration_minutes: z.number().int().positive(),
        price: z.number().nonnegative(),
        commission_percentage: z.number().min(0).max(100).optional(),
    }),
});

export const updateServiceSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        duration_minutes: z.number().int().positive().optional(),
        price: z.number().nonnegative().optional(),
        commission_percentage: z.number().min(0).max(100).optional(),
    }),
});
