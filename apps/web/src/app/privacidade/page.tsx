'use client';

import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-accent font-sans">
            <LandingHeader />

            <div className="container mx-auto px-4 py-32 max-w-4xl">
                <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidade</h1>

                <div className="space-y-6 text-lg leading-relaxed text-burgos-accent/80">
                    <p>
                        A Barbearia Burgos valoriza a sua privacidade e está comprometida em proteger os seus dados pessoais.
                        Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações ao utilizar nosso site e serviços.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Coleta de Informações</h2>
                    <p>
                        Coletamos informações pessoais que você nos fornece voluntariamente ao realizar agendamentos, cadastrar-se em nosso sistema ou assinar nossos planos.
                        Isso pode incluir seu nome, e-mail, telefone e dados de pagamento.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Uso das Informações</h2>
                    <p>Utilizamos seus dados para:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Processar seus agendamentos e pagamentos.</li>
                        <li>Enviar lembretes de agendamento e atualizações sobre sua assinatura.</li>
                        <li>Melhorar nossa plataforma e serviços.</li>
                        <li>Enviar comunicações de marketing (caso você tenha optado por receber).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Proteção de Dados</h2>
                    <p>
                        Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração ou destruição.
                        Seus dados de pagamento são processados por gateways seguros e não são armazenados diretamente em nossos servidores.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Cookies</h2>
                    <p>
                        Utilizamos cookies para melhorar sua experiência de navegação e analisar o tráfego do site.
                        Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Seus Direitos</h2>
                    <p>
                        Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento.
                        Para exercer esses direitos, entre em contato conosco através do e-mail listado abaixo.
                    </p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Contato</h2>
                    <p>
                        Se tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:<br />
                        E-mail: contato@burgosbarber.com<br />
                        WhatsApp: (11) 97950-4525
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
