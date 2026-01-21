
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

async function resetAppointments() {
    try {
        console.log('🗑️ Apagando todos os agendamentos...');

        // Delete dependent tables first if necessary (though cascade might handle it)
        const { error: servicesError } = await supabase.from('appointment_services').delete().neq('appointment_id', '00000000-0000-0000-0000-000000000000');
        if (servicesError) console.error('Erro ao limpar serviços:', servicesError);

        const { error: productsError } = await supabase.from('appointment_products').delete().neq('appointment_id', '00000000-0000-0000-0000-000000000000');
        if (productsError) console.error('Erro ao limpar produtos:', productsError);

        const { error: paymentsError } = await supabase.from('payments').delete().neq('appointment_id', '00000000-0000-0000-0000-000000000000');
        if (paymentsError) console.error('Erro ao limpar pagamentos:', paymentsError);

        const { error } = await supabase
            .from('appointments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete ALL

        if (error) {
            console.error('❌ Erro ao apagar agendamentos:', error);
        } else {
            console.log('✅ Banco de agendamentos zerado com sucesso!');
        }
    } catch (err) {
        console.error('❌ Erro fatal:', err);
    }
}

resetAppointments();
