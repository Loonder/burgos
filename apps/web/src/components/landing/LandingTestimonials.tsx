'use client';

import { Star, Quote } from 'lucide-react';

const REVIEWS = [
    {
        name: "Carlos Eduardo",
        role: "Cliente VIP",
        text: "Melhor barbearia da região! O sistema de assinatura vale muito a pena, corto o cabelo toda semana sem me preocupar com pagamento na hora.",
        stars: 5
    },
    {
        name: "Ricardo Silva",
        role: "Empresário",
        text: "Ambiente sensacional para fazer networking e relaxar. O atendimento é de primeira e a cerveja está sempre gelada.",
        stars: 5
    },
    {
        name: "Felipe Mendes",
        role: "Estudante",
        text: "Os barbeiros são artistas. Nunca tinham acertado meu corte como aqui. Recomendo demais o visagismo.",
        stars: 5
    }
];

export function LandingTestimonials() {
    return (
        <section className="py-24 bg-burgos-dark relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-burgos-primary text-sm font-bold uppercase tracking-widest mb-4">Depoimentos</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">O que dizem nossos clientes</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {REVIEWS.map((review, i) => (
                        <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/5 relative">
                            <Quote className="absolute top-8 right-8 text-white/5 rotate-180" size={64} />

                            <div className="flex gap-1 text-yellow-400 mb-6">
                                {[...Array(review.stars)].map((_, s) => <Star key={s} size={16} fill="currentColor" />)}
                            </div>

                            <p className="text-burgos-accent/80 mb-6 leading-relaxed relative z-10">
                                "{review.text}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-burgos-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{review.name}</h4>
                                    <p className="text-xs text-burgos-accent/50">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <a
                        href="https://www.google.com/search?q=barbearia+burgos"
                        target="_blank"
                        className="inline-flex items-center gap-2 text-burgos-primary hover:text-white transition-colors border-b border-burgos-primary pb-0.5"
                    >
                        Ver todas as avaliações no Google
                    </a>
                </div>
            </div>
        </section>
    );
}
