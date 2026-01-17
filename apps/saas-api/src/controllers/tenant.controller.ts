import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class TenantController {
    static async getMe(req: Request, res: Response) {
        try {
            const { id: userId } = req.user as any;
            const { data: user } = await supabase.from('users').select('tenant_id').eq('id', userId).single();
            if (!user?.tenant_id) return res.status(404).json({ error: 'Tenant not found' });

            const { data: tenant } = await supabase.from('tenants').select('*').eq('id', user.tenant_id).single();
            res.json(tenant);
        } catch (error) {
            logger.error('Error fetching tenant', error);
            res.status(500).json({ error: 'Failed to fetch tenant' });
        }
    }

    static async getPublic(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', slug).single();
            if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
            res.json(tenant);
        } catch (error) {
            logger.error('Error fetching public tenant', error);
            res.status(500).json({ error: 'Failed to fetch tenant' });
        }
    }

    static async updateBranding(req: Request, res: Response) {
        try {
            const { name, primary_color, secondary_color, logo_url, cover_images, social_links, welcome_message } = req.body;
            const { id: userId } = req.user as any;

            // Resolve Tenant from User
            const { data: user } = await supabase.from('users').select('tenant_id').eq('id', userId).single();
            if (!user?.tenant_id) return res.status(404).json({ error: 'Tenant not found' });

            const { data, error } = await supabase
                .from('tenants')
                .update({
                    name,
                    primary_color,
                    secondary_color,
                    logo_url,
                    cover_images,
                    social_links,
                    welcome_message
                })
                .eq('id', user.tenant_id)
                .select()
                .single();

            if (error) throw error;

            res.json({ message: 'Branding updated', data });
        } catch (error) {
            logger.error('Error updating branding', error);
            res.status(500).json({ error: 'Failed to update branding' });
        }
    }
}
