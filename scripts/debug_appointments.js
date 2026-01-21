require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkAppointments() {
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today:', today);
    console.log('🔍 Checking appointments...\n');

    // Check all appointments
    const { data: all, error: allError } = await supabase
        .from('appointments')
        .select('id, scheduled_at, status, client_id, barber_id')
        .order('scheduled_at', { ascending: false })
        .limit(10);

    if (allError) {
        console.error('❌ Error fetching all:', allError);
    } else {
        console.log(`📊 Total appointments (last 10): ${all?.length || 0}\n`);
        if (all && all.length > 0) {
            all.forEach((a, i) => {
                const date = new Date(a.scheduled_at).toISOString().split('T')[0];
                const time = new Date(a.scheduled_at).toLocaleTimeString();
                console.log(`${i + 1}. ${a.id} - ${date} ${time} - ${a.status}`);
            });
        }
    }

    console.log('\n---\n');

    // Check today's appointments
    const { data: today_appts, error: todayError } = await supabase
        .from('appointments')
        .select(`
            id, 
            scheduled_at, 
            status,
            client:users!client_id(name),
            barber:users!barber_id(name)
        `)
        .eq('scheduled_at::date', today)
        .order('scheduled_at');

    if (todayError) {
        console.error('❌ Error fetching today:', todayError);
    } else {
        console.log(`✅ Today's appointments (${today}): ${today_appts?.length || 0}\n`);
        if (today_appts && today_appts.length > 0) {
            today_appts.forEach((a, i) => {
                const time = new Date(a.scheduled_at).toLocaleTimeString();
                console.log(`${i + 1}. ${time} - ${a.client?.name} com ${a.barber?.name} - ${a.status}`);
            });
        } else {
            console.log('⚠️  Nenhum agendamento para hoje!');
        }
    }
}

checkAppointments().catch(console.error);
