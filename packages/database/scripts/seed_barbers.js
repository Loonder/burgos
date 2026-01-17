const { Client } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const barbers = [
    { name: 'Max', email: 'max@burgos.com' },
    { name: 'Guilherme', email: 'gui@burgos.com' },
    { name: 'Jotta', email: 'jotta@burgos.com' },
    { name: 'Amanda', email: 'amanda@burgos.com' },
    { name: 'André', email: 'andre@burgos.com' },
    { name: 'Gabriel', email: 'gabriel@burgos.com' },
];

async function seedBarbers() {
    await client.connect();
    try {
        const barberPassword = process.env.BARBER_PASSWORD;
        if (!barberPassword) {
            console.error('❌ Error: BARBER_PASSWORD is required in .env');
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(barberPassword, 10);

        for (const barber of barbers) {
            const check = await client.query("SELECT id FROM users WHERE name = $1 AND role = 'barbeiro'", [barber.name]);

            if (check.rows.length === 0) {
                console.log(`Creating barber: ${barber.name}`);
                await client.query(
                    "INSERT INTO users (name, email, password_hash, role, is_active) VALUES ($1, $2, $3, 'barbeiro', true)",
                    [barber.name, barber.email, passwordHash]
                );
            } else {
                console.log(`Barber exists: ${barber.name}`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

seedBarbers();
