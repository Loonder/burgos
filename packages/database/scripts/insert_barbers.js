
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

// Barbers from page.tsx
const BARBERS = [
    { id: '964b843d-68bd-48a7-9cbf-b71819c360ee', name: 'André' },
    { id: 'e3382e95-41c9-4caf-afb4-fb8ec55c1c13', name: 'Amanda' },
    { id: 'f9992bee-7ac5-4fd1-8a9b-55f6e5563a7d', name: 'Guilherme' },
    { id: '96afe6e4-3412-4571-b98c-1d88abcbcd18', name: 'Gabriel' },
    { id: '32d77f95-ad90-47e4-98c0-d82ad2f26fed', name: 'Max' },
    { id: '61a4cd9c-536e-4c3c-9368-6293b66252f5', name: 'Jotta' },
];

async function main() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        const barberPassword = process.env.BARBER_PASSWORD;
        if (!barberPassword) {
            console.error('❌ Error: BARBER_PASSWORD is required in .env');
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(barberPassword, 10);

        for (const barber of BARBERS) {
            const email = `${barber.name.toLowerCase()}@burgos.com`;

            // Check if user exists (by ID or Email)
            const res = await client.query('SELECT id FROM users WHERE id = $1', [barber.id]);

            if (res.rows.length > 0) {
                console.log(`Barber ${barber.name} already exists. Updating role/pass...`);
                await client.query(
                    'UPDATE users SET password_hash = $1, role = $2, email = $3, name = $4 WHERE id = $5',
                    [passwordHash, 'barbeiro', email, barber.name, barber.id]
                );
            } else {
                console.log(`Creating barber: ${barber.name} (${email})...`);
                await client.query(
                    `INSERT INTO users (id, name, email, password_hash, role, phone) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [barber.id, barber.name, email, passwordHash, 'barbeiro', '000000000']
                );
            }
            console.log(`✅ Configured: ${email}`);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
