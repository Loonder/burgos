'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
    {
        question: "Como funciona a assinatura?",
        answer: "Você paga um valor fixo mensal no cartão de crédito e tem acesso ilimitado aos serviços do seu plano. Pode cortar o cabelo ou fazer a barba quantas vezes quiser no mês, sem pagar nada a mais no balcão."
    },
    {
        question: "Preciso agendar horário sendo assinante?",
        answer: "Sim! Recomendamos o agendamento para garantir seu atendimento sem espera, mas assinantes têm acesso a horários prioritários e encaixes especiais."
    },
    {
        question: "Aceitam quais formas de pagamento?",
        answer: "Aceitamos cartões de crédito, débito, PIX e dinheiro. Para os planos de assinatura, o pagamento é recorrente no cartão de crédito (sem ocupar o limite total)."
    },
    {
        question: "Tem estacionamento no local?",
        answer: "Sim, contamos com estacionamento gratuito e seguro para clientes bem em frente à barbearia."
    }
];

export function LandingFAQ() {
    return (
        <section className="py-24 bg-burgos-secondary/20">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-burgos-primary text-sm font-bold uppercase tracking-widest mb-4">Dúvidas</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">Perguntas Frequentes</h3>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, i) => (
                        <FAQItem key={i} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="border border-white/10 rounded-xl overflow-hidden bg-burgos-dark transition-all hover:border-white/20 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="p-6 flex justify-between items-center gap-4">
                <h4 className="text-lg font-medium text-white">{question}</h4>
                {isOpen ? <ChevronUp className="text-burgos-primary" /> : <ChevronDown className="text-burgos-accent/50" />}
            </div>
            {isOpen && (
                <div className="px-6 pb-6 text-burgos-accent/70 leading-relaxed border-t border-white/5 pt-4">
                    {answer}
                </div>
            )}
        </div>
    );
}
