const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmin() {
    console.log('Seeding Admin User...');

    const email = process.env.ADMIN_EMAIL || 'admin@burgos.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
        console.error('❌ Error: ADMIN_PASSWORD is required in .env');
        process.exit(1);
    }
    const name = 'Administrador Burgos';
    const role = 'admin';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if exists
    const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (existing) {
        console.log('Admin exists. Updating password and role...');
        const { error } = await supabase
            .from('users')
            .update({
                password_hash: passwordHash,
                role: role,
                name: name
            })
            .eq('id', existing.id);

        if (error) console.error('Error updating admin:', error);
        else console.log('Admin updated successfully.');
    } else {
        console.log('Creating new Admin...');
        const { error } = await supabase
            .from('users')
            .insert([{
                email,
                password_hash: passwordHash,
                name,
                role,
                phone: '1199999999',
                is_active: true
            }]);

        if (error) console.error('Error creating admin:', error);
        else console.log('Admin created successfully.');
    }
}

seedAdmin();
