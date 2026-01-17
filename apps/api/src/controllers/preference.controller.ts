import { Request, Response } from 'express';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export const getLastPreferences = async (req: Request, res: Response) => {
    try {
        const { clientId } = req.params;

        if (!clientId) {
            return res.status(400).json({ error: 'Missing clientId' });
        }

        // Fetch the most recent appointment for this client that has preferences not null
        const { data, error } = await supabase
            .from('appointments')
            .select('preferences')
            .eq('client_id', clientId)
            .not('preferences', 'is', null) // Only those with prefs
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found", which is fine
            throw error;
        }

        if (!data) {
            return res.status(200).json({ preferences: null });
        }

        res.status(200).json({ preferences: data.preferences });
    } catch (error: any) {
        logger.error('Error fetching last preferences', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
