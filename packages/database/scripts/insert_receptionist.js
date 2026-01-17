
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

        const email = 'recepcao@burgos.com';
        const rawPassword = 'burgos_reception';
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        // Check if user exists
        const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            console.log('Receptionist already exists. Updating password...');
            await client.query('UPDATE users SET password_hash = $1, role = $2, name = $3 WHERE email = $4', [passwordHash, 'recepcionista', 'Recepção', email]);
        } else {
            console.log('Creating new receptionist...');
            await client.query(
                `INSERT INTO users (name, email, password_hash, role, phone) 
                 VALUES ($1, $2, $3, $4, $5)`,
                ['Recepção', email, passwordHash, 'recepcionista', '000000000']
            );
        }

        console.log(`✅ Receptionist configured: ${email} / ${rawPassword}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
