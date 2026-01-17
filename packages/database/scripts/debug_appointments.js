
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        // Get appointments for today (or recent)
        const res = await client.query(`
            SELECT a.id, a.scheduled_at, a.status, b.name as barber_name, c.name as client_name, a.barber_id
            FROM appointments a
            JOIN users b ON a.barber_id = b.id
            JOIN users c ON a.client_id = c.id
            ORDER BY a.created_at DESC
            LIMIT 5
        `);

        console.log('📅 Recent Appointments:', JSON.stringify(res.rows, null, 2));

        // Also check Barber IDs to match with Page.tsx
        const barbers = await client.query("SELECT id, name FROM users WHERE role = 'barbeiro'");
        console.log('💈 Barbers in DB:', JSON.stringify(barbers.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
