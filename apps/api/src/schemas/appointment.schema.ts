import { z } from 'zod';

export const createAppointmentSchema = z.object({
    body: z.object({
        barberId: z.string().uuid('ID do barbeiro inválido'),
        serviceId: z.string().uuid('ID do serviço inválido').optional(), // Legacy support
        serviceIds: z.array(z.string().uuid()).optional(), // New support
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
        time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida (HH:MM)'),
        preferences: z.record(z.any()).optional(),
        clientId: z.string().uuid('ID do cliente inválido').optional(),
        productIds: z.array(z.string().uuid()).optional(),
    }),
});

export const updateAppointmentSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID inválido'),
    }),
    body: z.object({
        status: z.enum(['agendado', 'concluido', 'cancelado', 'no_show', 'aguardando']).optional(),
        scheduledAt: z.string().datetime().optional(),
    }),
});
