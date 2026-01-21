/**
 * Creates/resets admin account
 * Run: node scripts/reset_admin.js
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN = {
    email: 'admin@burgos.com',
    password: process.env.ADMIN_PASSWORD || 'admin123', // 6+ chars for validation
    name: 'Admin Burgos'
};

async function run() {
    console.log('🔧 Resetting Admin Account...\n');

    try {
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', ADMIN.email)
            .single();

        // Hash password 
        const hashedPassword = await bcrypt.hash(ADMIN.password, 10);

        if (existingUser) {
            // Update existing
            const { error } = await supabase
                .from('users')
                .update({
                    password_hash: hashedPassword,
                    role: 'admin'
                })
                .eq('id', existingUser.id);

            if (error) throw error;
            console.log('✅ Admin password updated');
        } else {
            // Create new
            const { error } = await supabase
                .from('users')
                .insert({
                    email: ADMIN.email,
                    password_hash: hashedPassword,
                    name: ADMIN.name,
                    role: 'admin'
                });

            if (error) throw error;
            console.log('✅ Admin account created');
        }

        console.log('\n==================================');
        console.log('📧 Email:    ' + ADMIN.email);
        console.log('🔑 Password: ' + ADMIN.password);
        console.log('==================================\n');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

run();
