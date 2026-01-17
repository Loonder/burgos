
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const email = 'admin@burgos.com';
        const rawPassword = 'admin'; // Simple password for now
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        // Check if admin exists
        const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            console.log('Admin already exists. Updating password...');
            await client.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [passwordHash, 'admin', email]);
        } else {
            console.log('Creating new admin...');
            await client.query(
                `INSERT INTO users (name, email, password_hash, role, phone) 
                 VALUES ($1, $2, $3, $4, $5)`,
                ['Admin Master', email, passwordHash, 'admin', '000000000']
            );
        }

        console.log(`✅ Admin configured: ${email} / ${rawPassword}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
