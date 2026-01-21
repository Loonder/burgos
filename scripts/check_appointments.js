require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkAppointments() {
    console.log('🔍 Checking last 5 appointments...\n');

    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            id,
            client_id,
            barber_id,
            service_id,
            scheduled_at,
            status,
            duration_minutes,
            created_at,
            appointment_services(service_id, price)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('❌ Error:', error);
        return;
    }

    if (!appointments || appointments.length === 0) {
        console.log('⚠️  No appointments found in database!');
        return;
    }

    console.log(`✅ Found ${appointments.length} appointments:\n`);
    appointments.forEach((appt, i) => {
        console.log(`${i + 1}. ID: ${appt.id}`);
        console.log(`   Client: ${appt.client_id}`);
        console.log(`   Barber: ${appt.barber_id}`);
        console.log(`   Scheduled: ${appt.scheduled_at}`);
        console.log(`   Status: ${appt.status}`);
        console.log(`   Duration: ${appt.duration_minutes} min`);
        console.log(`   Services: ${appt.appointment_services?.length || 0}`);
        console.log(`   Created: ${appt.created_at}\n`);
    });
}

checkAppointments().catch(console.error);
