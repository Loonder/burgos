const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function addBirthDate() {
    console.log('Adding birth_date column to users table...');
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;');
        console.log('✅ Column birth_date added successfully (or already exists).');
    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        await pool.end();
    }
}

addBirthDate();
