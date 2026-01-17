import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class ProductController {

    // GET /api/products (Public - for booking suggestions)
    static async listProducts(req: Request, res: Response) {
        try {
            const { showOnBooking, serviceId } = req.query;

            let query = supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (showOnBooking === 'true') {
                query = query.eq('show_on_booking', true);
            }

            const { data, error } = await query;
            if (error) throw error;

            // If serviceId provided, prioritize products linked to that service
            if (serviceId && data) {
                const { data: suggestions } = await supabase
                    .from('service_product_suggestions')
                    .select('product_id, priority')
                    .eq('service_id', serviceId);

                const suggestionMap = new Map(suggestions?.map(s => [s.product_id, s.priority]) || []);

                data.sort((a, b) => {
                    const priorityA = suggestionMap.get(a.id) ?? -1;
                    const priorityB = suggestionMap.get(b.id) ?? -1;
                    return priorityB - priorityA;
                });
            }

            res.json({ data });
        } catch (error) {
            logger.error('List Products Error', error);
            res.status(500).json({ error: 'Erro ao listar produtos' });
        }
    }

    // GET /api/products/:id
    static async getProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            res.json({ data });
        } catch (error) {
            logger.error('Get Product Error', error);
            res.status(500).json({ error: 'Erro ao buscar produto' });
        }
    }
}

export class AdminProductController {

    // GET /api/admin/products
    static async listAll(req: Request, res: Response) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json({ data });
        } catch (error) {
            logger.error('Admin List Products Error', error);
            res.status(500).json({ error: 'Erro ao listar produtos' });
        }
    }

    // POST /api/admin/products
    static async create(req: Request, res: Response) {
        try {
            const { name, description, price, image, category, stock, show_on_booking } = req.body;

            const { data, error } = await supabase
                .from('products')
                .insert({
                    name,
                    description,
                    price,
                    image,
                    category: category || 'geral',
                    stock: stock || 0,
                    show_on_booking: show_on_booking !== false
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json({ success: true, data });
        } catch (error) {
            logger.error('Create Product Error', error);
            res.status(500).json({ error: 'Erro ao criar produto' });
        }
    }

    // PUT /api/admin/products/:id
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const { error } = await supabase
                .from('products')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            res.json({ success: true });
        } catch (error) {
            logger.error('Update Product Error', error);
            res.status(500).json({ error: 'Erro ao atualizar produto' });
        }
    }

    // DELETE /api/admin/products/:id
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.json({ success: true });
        } catch (error) {
            logger.error('Delete Product Error', error);
            res.status(500).json({ error: 'Erro ao deletar produto' });
        }
    }

    // POST /api/admin/products/:id/link-service
    static async linkToService(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { service_id, priority } = req.body;

            const { error } = await supabase
                .from('service_product_suggestions')
                .upsert({
                    product_id: id,
                    service_id,
                    priority: priority || 0
                });

            if (error) throw error;
            res.json({ success: true });
        } catch (error) {
            logger.error('Link Product to Service Error', error);
            res.status(500).json({ error: 'Erro ao vincular produto' });
        }
    }
}
