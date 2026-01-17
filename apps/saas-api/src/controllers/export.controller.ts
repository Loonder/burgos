import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class ExportController {

    // Helper to convert JSON to CSV
    private static jsonToCSV(data: any[], columns: string[]): string {
        if (!data || data.length === 0) return columns.join(',') + '\n';

        const header = columns.join(',');
        const rows = data.map(row =>
            columns.map(col => {
                let value = row[col];
                if (value === null || value === undefined) value = '';
                if (typeof value === 'object') value = JSON.stringify(value);
                // Escape quotes and wrap in quotes if contains comma
                value = String(value).replace(/"/g, '""');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = `"${value}"`;
                }
                return value;
            }).join(',')
        );
        return header + '\n' + rows.join('\n');
    }

    // GET /api/export/clients
    static async exportClients(req: Request, res: Response) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, phone, created_at')
                .eq('role', 'cliente')
                .order('name');

            if (error) throw error;

            const csv = ExportController.jsonToCSV(data || [], ['id', 'name', 'email', 'phone', 'created_at']);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=clientes.csv');
            res.send(csv);
        } catch (error) {
            logger.error('Export Clients Error', error);
            res.status(500).json({ error: 'Erro ao exportar clientes' });
        }
    }

    // GET /api/export/appointments
    static async exportAppointments(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            let query = supabase
                .from('appointments')
                .select(`
                    id,
                    start_time,
                    end_time,
                    status,
                    client:users!client_id(name, email),
                    barber:users!barber_id(name),
                    service:services(name, price)
                `)
                .order('start_time', { ascending: false });

            if (startDate) query = query.gte('start_time', new Date(startDate as string).toISOString());
            if (endDate) query = query.lte('start_time', new Date(endDate as string).toISOString());

            const { data, error } = await query;
            if (error) throw error;

            // Flatten nested data
            const flattened = data?.map(apt => ({
                id: apt.id,
                data: apt.start_time,
                horario_fim: apt.end_time,
                status: apt.status,
                cliente_nome: (apt.client as any)?.name || '',
                cliente_email: (apt.client as any)?.email || '',
                barbeiro: (apt.barber as any)?.name || '',
                servico: (apt.service as any)?.name || '',
                valor: (apt.service as any)?.price || 0
            }));

            const csv = ExportController.jsonToCSV(flattened || [],
                ['id', 'data', 'horario_fim', 'status', 'cliente_nome', 'cliente_email', 'barbeiro', 'servico', 'valor']);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=agendamentos.csv');
            res.send(csv);
        } catch (error) {
            logger.error('Export Appointments Error', error);
            res.status(500).json({ error: 'Erro ao exportar agendamentos' });
        }
    }

    // GET /api/export/transactions
    static async exportTransactions(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;

            let query = supabase
                .from('transactions')
                .select(`
                    id,
                    type,
                    category,
                    amount,
                    payment_method,
                    description,
                    created_at,
                    barber:users!barber_id(name)
                `)
                .order('created_at', { ascending: false });

            if (startDate) query = query.gte('created_at', new Date(startDate as string).toISOString());
            if (endDate) query = query.lte('created_at', new Date(endDate as string).toISOString());

            const { data, error } = await query;
            if (error) throw error;

            const flattened = data?.map(t => ({
                id: t.id,
                tipo: t.type === 'income' ? 'Entrada' : 'Saída',
                categoria: t.category,
                valor: t.amount,
                forma_pagamento: t.payment_method,
                descricao: t.description,
                barbeiro: (t.barber as any)?.name || '',
                data: t.created_at
            }));

            const csv = ExportController.jsonToCSV(flattened || [],
                ['id', 'tipo', 'categoria', 'valor', 'forma_pagamento', 'descricao', 'barbeiro', 'data']);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transacoes.csv');
            res.send(csv);
        } catch (error) {
            logger.error('Export Transactions Error', error);
            res.status(500).json({ error: 'Erro ao exportar transações' });
        }
    }

    // GET /api/export/products
    static async exportProducts(req: Request, res: Response) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, description, price, stock, category, is_active')
                .order('name');

            if (error) throw error;

            const csv = ExportController.jsonToCSV(data || [],
                ['id', 'name', 'description', 'price', 'stock', 'category', 'is_active']);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=produtos.csv');
            res.send(csv);
        } catch (error) {
            logger.error('Export Products Error', error);
            res.status(500).json({ error: 'Erro ao exportar produtos' });
        }
    }
}
