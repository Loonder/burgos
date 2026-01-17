const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const { randomUUID } = require('crypto');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function seedCheckIn() {
    try {
        await client.connect();

        // 1. Ensure User with Phone exists
        const phone = '11999999999';
        const email = 'checkin_test@burgos.com';

        // Upsert User
        let userRes = await client.query("SELECT id FROM users WHERE email = $1", [email]);
        let userId;

        if (userRes.rows.length === 0) {
            userId = randomUUID();
            await client.query(
                "INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
                [userId, 'Test CheckIn', email, phone, 'hash', 'cliente']
            );
            console.log('Created User:', userId);
        } else {
            userId = userRes.rows[0].id;
            await client.query("UPDATE users SET phone = $1 WHERE id = $2", [phone, userId]);
            console.log('Updated User:', userId);
        }

        // 2. Create Appointment for TODAY
        const today = new Date().toISOString().split('T')[0];

        // Get a Barber and Service
        const barberRes = await client.query("SELECT id FROM users WHERE role = 'barbeiro' LIMIT 1");
        const serviceRes = await client.query("SELECT id FROM services LIMIT 1");

        if (barberRes.rows.length === 0 || serviceRes.rows.length === 0) {
            throw new Error('No barber or service found');
        }

        const barberId = barberRes.rows[0].id;
        const serviceId = serviceRes.rows[0].id;

        // Create/Update Appointment
        // Check if exists
        const apptRes = await client.query(
            "SELECT id FROM appointments WHERE client_id = $1 AND scheduled_at::date = $2",
            [userId, today]
        );

        if (apptRes.rows.length === 0) {
            await client.query(
                `INSERT INTO appointments (id, client_id, barber_id, service_id, scheduled_at, status, price)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [randomUUID(), userId, barberId, serviceId, `${today} 14:00:00`, 'agendado', 50.00]
            );
            console.log('Created Appointment for Today 14:00');
        } else {
            console.log('Appointment already exists for today.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

seedCheckIn();
