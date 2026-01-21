'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export function LandingPlans() {
    return (
        <section id="planos" className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-burgos-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="bg-burgos-primary/10 text-burgos-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">
                        Economia Inteligente
                    </span>
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Assine & Economize</h2>
                    <p className="text-burgos-accent/70 max-w-2xl mx-auto text-lg">
                        Tenha acesso ilimitado aos melhores serviços da barbearia pagando um valor fixo mensal.
                        Sem surpresas, sem limites.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {/* Basic Plan */}
                    <PlanCard
                        name="Cabelo Ilimitado"
                        price="89,90"
                        features={[
                            "Cortes ilimitados",
                            "Agendamento prioritário",
                            "Bebida cortesia",
                            "10% off em produtos"
                        ]}
                    />

                    {/* Featured Plan */}
                    <PlanCard
                        name="VIP Experience"
                        price="149,90"
                        isPopular
                        features={[
                            "Cabelo + Barba ilimitados",
                            "Sobrancelha inclusa",
                            "Barboterapia mensal",
                            "Agendamento VIP",
                            "Bebida liberada",
                            "20% off em produtos"
                        ]}
                    />

                    {/* Premium Plan */}
                    <PlanCard
                        name="Barba Ilimitada"
                        price="79,90"
                        features={[
                            "Barba ilimitada",
                            "Barboterapia inclusa",
                            "Toalha quente",
                            "Agendamento prioritário"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}

function PlanCard({ name, price, features, isPopular }: { name: string, price: string, features: string[], isPopular?: boolean }) {
    return (
        <div className={`relative p-8 rounded-3xl border transition-all duration-300 ${isPopular
                ? 'bg-burgos-dark border-burgos-primary shadow-[0_0_40px_rgba(255,159,28,0.15)] scale-105 z-10'
                : 'bg-burgos-secondary/10 border-white/5 hover:border-white/10'
            }`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-burgos-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Mais Vendido
                </div>
            )}

            <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm text-burgos-accent/70">R$</span>
                <span className="text-4xl font-bold text-white">{price}</span>
                <span className="text-sm text-burgos-accent/70">/mês</span>
            </div>

            <ul className="space-y-4 mb-8">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-burgos-accent/80 text-sm">
                        <CheckCircle2 size={18} className="text-burgos-primary shrink-0 mt-0.5" />
                        {feature}
                    </li>
                ))}
            </ul>

            <Link
                href="/agendamento"
                className={`w-full block text-center py-3 rounded-xl font-bold transition-all ${isPopular
                        ? 'bg-burgos-primary text-white hover:shadow-lg hover:-translate-y-1'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
            >
                Assinar Agora
            </Link>
        </div>
    );
}
