import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import { cacheService } from '../services/cache.service';

export class ServiceController {
    static async getServices(req: Request, res: Response) {
        try {
            const { category } = req.query;
            const cacheKey = category ? `services:${category}` : 'services';

            const cached = cacheService.get(cacheKey);
            if (cached) {
                return res.status(200).json({ data: cached });
            }

            let query = supabase
                .from('services')
                .select('*')
                .order('name');
            query = query.eq('is_active', true);
            const { data, error } = await query;
            if (error) throw error;

            cacheService.set(cacheKey, data);
            res.status(200).json({ data });
        } catch (error: any) {
            logger.error('Error fetching services', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }

    static async createService(req: Request, res: Response) {
        try {
            const { name, description, duration_minutes, price, commission_percentage } = req.body;
            const { data, error } = await supabase
                .from('services')
                .insert({ name, description, duration_minutes, price, commission_percentage })
                .select()
                .single();
            if (error) throw error;

            cacheService.flush(); // Invalidate all service caches
            logger.info(`Service created: ${name}`);
            res.status(201).json({ message: 'Service created', data });
        } catch (error: any) {
            logger.error('Error creating service', error);
            res.status(500).json({ error: error.message || 'Error creating service' });
        }
    }

    static async updateService(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const { data, error } = await supabase
                .from('services')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;

            cacheService.flush(); // Invalidate
            res.status(200).json({ message: 'Service updated', data });
        } catch (error: any) {
            logger.error('Error updating service', error);
            res.status(500).json({ error: error.message || 'Error updating service' });
        }
    }

    static async deleteService(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('services')
                .update({ is_active: false, deleted_at: new Date() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;

            cacheService.flush(); // Invalidate
            res.status(200).json({ message: 'Service deleted (archived)', data });
        } catch (error: any) {
            logger.error('Error deleting service', error);
            res.status(500).json({ error: error.message || 'Error deleting service' });
        }
    }
}
