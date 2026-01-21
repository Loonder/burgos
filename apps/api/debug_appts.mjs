import { supabase } from './config/database.js';

async function checkAppointments() {
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', today);

    try {
        // Check all recent
        const { data: all } = await supabase
            .from('appointments')
            .select('id, scheduled_at, status')
            .order('created_at', { ascending: false })
            .limit(5);

        console.log(`\n📊 Últimos 5 agendamentos:`);
        all?.forEach(a => {
            const date = new Date(a.scheduled_at).toISOString().split('T')[0];
            const time = new Date(a.scheduled_at).toLocaleTimeString('pt-BR');
            console.log(`  - ${date} ${time} [${a.status}]`);
        });

        // Check today
        const { data: todayAppts } = await supabase
            .from('appointments')
            .select(`
                id, scheduled_at, status,
                client:users!client_id(name),
                barber:users!barber_id(name)
            `)
            .gte('scheduled_at', `${today}T00:00:00`)
            .lt('scheduled_at', `${today}T23:59:59`);

        console.log(`\n✅ Agendamentos de HOJE (${today}): ${todayAppts?.length || 0}`);
        todayAppts?.forEach((a, i) => {
            const time = new Date(a.scheduled_at).toLocaleTimeString('pt-BR');
            console.log(`  ${i + 1}. ${time} - ${a.client?.name} com ${a.barber?.name}`);
        });

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

checkAppointments();
