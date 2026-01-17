const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function getData() {
    await client.connect();

    const fs = require('fs');
    let output = '';
    const log = (msg) => { output += msg + '\n'; console.log(msg); };

    log('--- SERVICES ---');
    const resServices = await client.query('SELECT id, name FROM services');
    resServices.rows.forEach(r => log(`${r.name}: ${r.id}`));

    log('\n--- BARBERS ---');
    const resUsers = await client.query("SELECT id, name, role FROM users WHERE role = 'barbeiro'");
    if (resUsers.rows.length === 0) {
        log('No barbers found. Creating sample barbers...');
        const insertBarbers = `
            INSERT INTO users (email, password_hash, name, role, avatar_url) VALUES 
            ('carlos@burgos.com', 'hash', 'Carlos The Blade', 'barbeiro', '/barber-carlos.png'),
            ('danilo@burgos.com', 'hash', 'Danilo Silva', 'barbeiro', '/barber-danilo.png'),
            ('roberto@burgos.com', 'hash', 'Roberto Júnior', 'barbeiro', '/barber-roberto.png')
            RETURNING id, name;
        `;
        const newBarbers = await client.query(insertBarbers);
        newBarbers.rows.forEach(r => log(`${r.name}: ${r.id}`));
    } else {
        resUsers.rows.forEach(r => log(`${r.name}: ${r.id}`));
    }

    fs.writeFileSync(path.join(__dirname, '../../../db_ids.txt'), output);
    await client.end();
}

getData().catch(e => {
    console.error(e);
    process.exit(1);
});
