
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

        const passwordHash = await bcrypt.hash('cliente123', 10);

        const clients = [
            { name: 'Cliente Avulso', email: 'walkin@burgos.com' }, // For walk-ins
            { name: 'João Silva', email: 'joao@teste.com' },
            { name: 'Maria Oliveira', email: 'maria@teste.com' },
            { name: 'Pedro Santos', email: 'pedro@teste.com' },
            { name: 'Lucas Almeida', email: 'lucas@teste.com' }
        ];

        for (const c of clients) {
            // Check if exists
            const res = await client.query('SELECT id FROM users WHERE email = $1', [c.email]);

            if (res.rows.length === 0) {
                await client.query(
                    `INSERT INTO users (name, email, password_hash, role, phone) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [c.name, c.email, passwordHash, 'cliente', '11999999999']
                );
                console.log(`✅ Created: ${c.name}`);
            } else {
                console.log(`ℹ️ Exists: ${c.name}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

main();
