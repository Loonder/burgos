const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function seedSchedules() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        // 1. Get all barbers
        const resBarbers = await client.query("SELECT id, name FROM users WHERE role = 'barbeiro'");
        const barbers = resBarbers.rows;

        if (barbers.length === 0) {
            console.log('⚠ No barbers found. Run seed_real.js first.');
            return;
        }

        console.log(`found ${barbers.length} barbers. Seeding schedules...`);

        // 2. Clear existing schedules
        await client.query('DELETE FROM barber_schedules');

        // 3. Insert schedules (Mon-Sat: 1-6, 09:00 - 20:00)
        // Adjust as needed. 0=Sun, 1=Mon, ..., 6=Sat
        const days = [1, 2, 3, 4, 5, 6];
        const startTime = '09:00:00';
        const endTime = '20:00:00';

        for (const barber of barbers) {
            for (const day of days) {
                await client.query(
                    `INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time) 
                     VALUES ($1, $2, $3, $4)`,
                    [barber.id, day, startTime, endTime]
                );
            }
            console.log(`✅ Schedule set for ${barber.name}`);
        }

        console.log('📅 All schedules seeded!');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seedSchedules();
