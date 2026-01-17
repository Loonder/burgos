
import { Request, Response } from 'express';
import { supabase } from '../config/database';

export const getClients = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, phone, email, avatar_url')
            .eq('role', 'cliente')
            .order('name');

        if (error) throw error;

        res.json({ data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
