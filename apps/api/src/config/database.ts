import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Debug current working directory
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Try multiple paths for .env file
const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../.env'),
    'D:\\Bkp\\www\\Burgos\\.env', // Absolute path as last resort
];

let envLoaded = false;
for (const envPath of envPaths) {
    console.log(`Trying .env path: ${envPath}`);
    if (fs.existsSync(envPath)) {
        console.log(`✅ Found .env at: ${envPath}`);
        const result = dotenv.config({ path: envPath });
        if (result.error) {
            console.error('Error loading .env:', result.error);
        } else {
            console.log('✅ .env loaded successfully');
            envLoaded = true;
            break;
        }
    }
}

if (!envLoaded) {
    console.error('❌ Could not find .env file in any of the tried paths');
}

// Debug env vars
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables:');
    console.error('SUPABASE_URL:', supabaseUrl || 'MISSING');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
    throw new Error('Missing Supabase environment variables');
}

import { Pool } from 'pg';

// Service role client for API (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('Missing environment variable: DATABASE_URL');
    throw new Error('Missing Database environment variable');
}

// Create a new pool using the connection string from env
export const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
