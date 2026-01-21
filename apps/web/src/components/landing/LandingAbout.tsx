'use client';

import { Award, Users, Scissors, Clock } from 'lucide-react';

export function LandingAbout() {
    return (
        <section id="sobre" className="py-24 relative overflow-hidden bg-burgos-secondary/20 block">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-burgos-primary text-sm font-bold uppercase tracking-widest mb-4">Sobre a Barbearia</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">Mais que um corte, um legado.</h3>
                    <p className="text-burgos-accent/70 text-lg leading-relaxed">
                        Fundada com a missão de resgatar a cavalheira clássica com toques modernos, a Barbearia Burgos se tornou referência em Taboão da Serra.
                        Entendemos que o cabelo e a barba são a moldura do rosto e têm o poder de transformar a autoestima e a imagem pessoal de um homem.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    <StatCard
                        icon={<Users size={32} />}
                        number="+3.000"
                        label="Clientes Atendidos"
                    />
                    <StatCard
                        icon={<Scissors size={32} />}
                        number="+15.000"
                        label="Cortes Realizados"
                    />
                    <StatCard
                        icon={<Award size={32} />}
                        number="4.9"
                        label="Nota Média (Google)"
                    />
                    <StatCard
                        icon={<Clock size={32} />}
                        number="5 Anos"
                        label="De Excelência"
                    />
                </div>
            </div>
        </section>
    );
}

function StatCard({ icon, number, label }: { icon: any, number: string, label: string }) {
    return (
        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-burgos-primary/30 transition-all group">
            <div className="w-12 h-12 mx-auto mb-4 bg-burgos-primary/10 rounded-full flex items-center justify-center text-burgos-primary group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="text-3xl font-bold text-white mb-1 font-display">{number}</h4>
            <p className="text-sm text-burgos-accent/60 uppercase tracking-wide">{label}</p>
        </div>
    );
}
