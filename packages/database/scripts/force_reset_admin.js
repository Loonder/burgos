const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function reset() {
    console.log('Connecting to DB...');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    try {
        const email = process.env.ADMIN_EMAIL || 'admin@burgos.com';
        const password = process.env.ADMIN_PASSWORD;

        if (!password) {
            console.error('❌ Error: ADMIN_PASSWORD is required in .env');
            process.exit(1);
        }

        const hash = await bcrypt.hash(password, 10);

        // 1. Get Tenant
        const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = 'burgos'");
        const tenantId = tenantRes.rows[0]?.id;

        if (!tenantId) {
            console.error('❌ Tenant "burgos" not found. Cannot assign admin.');
            process.exit(1);
        }
        console.log(`Found tenant 'burgos': ${tenantId}`);

        // 2. Check User
        const userRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userRes.rows.length > 0) {
            console.log('User exists. Updating password and linking to tenant...');
            await client.query(`
                UPDATE users 
                SET password_hash = $1, role = 'admin', tenant_id = $2
                WHERE email = $3
            `, [hash, tenantId, email]);
        } else {
            console.log('Creating new Admin user...');
            await client.query(`
                INSERT INTO users (email, password_hash, name, role, is_active, tenant_id)
                VALUES ($1, $2, 'Admin Force', 'admin', true, $3)
            `, [email, hash, tenantId]);
        }
        console.log('✅ Admin reset successfully.');
        console.log(`Email: ${email}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

reset();
