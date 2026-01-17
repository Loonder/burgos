const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../apps/web/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SERVICE_IMAGES = {
    'Corte de Cabelo': '/services/corte.png',
    'Barbaa': '/services/barba.png', // Typos might exist in DB seed
    'Barba': '/services/barba.png',
    'Sobrancelha': '/services/sobrancelha.png',
    'Corte + Barba': '/services/barba.png', // Reuse
};

async function updateServiceImages() {
    console.log('Fetching services...');
    const { data: services, error } = await supabase.from('services').select('*');

    if (error) {
        console.error('Error fetching services:', error);
        return;
    }

    console.log(`Found ${services.length} services.`);

    for (const service of services) {
        let imageUrl = null;

        // Simple matching logic
        if (service.name.includes('Corte') && service.name.includes('Barba')) {
            imageUrl = '/services/barba.png';
        } else if (service.name.includes('Corte')) {
            imageUrl = '/services/corte.png';
        } else if (service.name.includes('Barba')) {
            imageUrl = '/services/barba.png';
        } else if (service.name.includes('Sobrancelha')) {
            imageUrl = '/services/sobrancelha.png';
        }

        if (imageUrl) {
            console.log(`Updating ${service.name} with ${imageUrl}`);
            await supabase
                .from('services')
                .update({ image: imageUrl }) // Assuming 'image' column exists; check controller/DB
                .eq('id', service.id);
        }
    }
    console.log('Update complete.');
}

updateServiceImages();
