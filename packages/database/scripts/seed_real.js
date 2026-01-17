const { Client } = require('pg');
const path = require('path');
// Use robust env path resolution
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const SERVICES = [
    { name: 'Corte Adulto', price: 50.00, duration: 45, category: 'cabelo' },
    { name: 'Corte Infantil', price: 45.00, duration: 45, category: 'cabelo' },
    { name: 'Pezinho (Acabamento)', price: 20.00, duration: 15, category: 'acabamento' },
    { name: 'Raspar Cabeça', price: 35.00, duration: 30, category: 'cabelo' },
    { name: 'Barboterapia (Cabelo e Barba)', price: 90.00, duration: 90, category: 'combo' },
    { name: 'Tonalização de Barba', price: 35.00, duration: 30, category: 'barba' },
    { name: 'Camuflagem de Grisalhos', price: 40.00, duration: 45, category: 'cabelo' },
    { name: 'Sobrancelhas (Navalha ou Pinça)', price: 20.00, duration: 15, category: 'rosto' },
    { name: 'Limpeza de Pele', price: 60.00, duration: 45, category: 'rosto' },
    { name: 'Hidratação', price: 30.00, duration: 20, category: 'cabelo' },
    { name: 'Depilação Nasal na Cera', price: 15.00, duration: 10, category: 'rosto' },
    { name: 'Selagem', price: 80.00, duration: 60, category: 'quimica' },
    { name: 'Relaxamento', price: 60.00, duration: 60, category: 'quimica' },
    { name: 'Platinado', price: 120.00, duration: 120, category: 'quimica' },
    { name: 'Luzes', price: 100.00, duration: 90, category: 'quimica' },
    { name: 'Visagismo (Corte e Barba)', price: 110.00, duration: 90, category: 'combo' }
];

const BARBERS = [
    { name: 'André', email: 'andre@burgos.com', role: 'barbeiro', avatar: '/barbers/andre.png' },
    { name: 'Amanda', email: 'amanda@burgos.com', role: 'barbeiro', avatar: '/barbers/amanda.png' },
    { name: 'Guilherme', email: 'guilherme@burgos.com', role: 'barbeiro', avatar: '/barbers/guilherme.png' },
    { name: 'Gabriel', email: 'gabriel@burgos.com', role: 'barbeiro', avatar: '/barbers/gabriel.png' },
    { name: 'Max', email: 'max@burgos.com', role: 'barbeiro', avatar: '/barbers/max.png' },
    { name: 'Jotta', email: 'jotta@burgos.com', role: 'barbeiro', avatar: '/barbers/jotta.png' }
];

async function seed() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB');

        // 1. Clear existing Services and Barbers (Optional: Safe for dev)
        // Be careful in prod, but for now we want valid matching IDs
        console.log('🧹 Cleaning old data...');
        await client.query('DELETE FROM services');
        await client.query("DELETE FROM users WHERE role = 'barbeiro'");

        // 2. Insert Services
        console.log('✂ Inserting Services...');
        for (const s of SERVICES) {
            await client.query(
                'INSERT INTO services (name, description, price, duration_minutes) VALUES ($1, $2, $3, $4)',
                [s.name, s.name, s.price, s.duration]
            );
        }

        // 3. Insert Barbers
        console.log('💈 Inserting Barbers...');
        for (const b of BARBERS) {
            await client.query(
                `INSERT INTO users (name, email, password_hash, role, avatar_url) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [b.name, b.email, 'hash_placeholder', b.role, b.avatar]
            );
        }

        console.log('✅ Seeding complete!');

        // Output new IDs for Frontend
        console.log('\n--- NEW IDS ---');
        const services = await client.query('SELECT name, id FROM services');
        const barbers = await client.query("SELECT name, id FROM users WHERE role = 'barbeiro'");

        let fileOutput = '--- SERVICES ---\n';
        services.rows.forEach(r => {
            console.log(`Service: ${r.name} -> ${r.id}`);
            fileOutput += `${r.name}: ${r.id}\n`;
        });

        fileOutput += '\n--- BARBERS ---\n';
        barbers.rows.forEach(r => {
            console.log(`Barber: ${r.name} -> ${r.id}`);
            fileOutput += `${r.name}: ${r.id}\n`;
        });

        const fs = require('fs');
        fs.writeFileSync(path.join(__dirname, '../../../real_db_ids.txt'), fileOutput);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await client.end();
    }
}

seed();
