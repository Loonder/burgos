'use client';

import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-accent font-sans">
            <LandingHeader />

            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <h1 className="text-4xl font-bold text-white mb-8">Termos de Uso</h1>

                <div className="space-y-6 text-lg leading-relaxed text-burgos-accent/80">
                    <p>
                        Bem-vindo à Barbearia Burgos. Ao acessar nosso site e utilizar nossos serviços, você concorda em cumprir estes Termos de Uso.
                        Por favor, leia-os atentamente.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Serviços</h2>
                    <p>
                        A Barbearia Burgos oferece serviços de barbearia, corte de cabelo e estética masculina, além de planos de assinatura mensais.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Agendamentos</h2>
                    <p>
                        Os agendamentos podem ser realizados através de nossa plataforma online. Pedimos que chegue com pelo menos 5 minutos de antecedência.
                        Cancelamentos devem ser feitos com no mínimo 2 horas de antecedência. O não comparecimento sem aviso prévio pode sujeitar o cliente a restrições em agendamentos futuros.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Planos de Assinatura</h2>
                    <p>
                        Ao assinar um de nossos planos, você concorda com a cobrança recorrente mensal no cartão de crédito cadastrado.
                        Os benefícios do plano são pessoais e intransferíveis. O cancelamento pode ser solicitado a qualquer momento pelo painel do usuário ou em contato com o suporte, sem multa, desde que solicitado 24h antes da renovação.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Conduta</h2>
                    <p>
                        Esperamos que todos os clientes mantenham uma conduta respeitosa com nossos profissionais e outros clientes.
                        Reservamo-nos o direito de recusar atendimento a qualquer pessoa que demonstre comportamento inadequado.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Propriedade Intelectual</h2>
                    <p>
                        Todo o conteúdo deste site, incluindo logotipos, textos e imagens, é propriedade da Barbearia Burgos e está protegido por leis de direitos autorais.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Alterações nos Termos</h2>
                    <p>
                        Podemos atualizar estes Termos de Uso periodicamente. Recomendamos que você revise esta página regularmente para estar ciente de quaisquer alterações.
                    </p>

                    <p className="text-sm text-burgos-accent/50 mt-12 pt-8 border-t border-white/10">
                        Última atualização: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>

            <LandingFooter />
        </main>
    );
}
