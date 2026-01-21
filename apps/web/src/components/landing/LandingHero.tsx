'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

export function LandingHero() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-burgos-dark"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-burgos-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-burgos-secondary/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-8 animate-fade-in">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                        <span className="text-white/80 text-xs font-medium uppercase tracking-wider">+280 Avaliações 5 Estrelas</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] text-white uppercase tracking-tight">
                        A Arte da <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-burgos-primary to-yellow-200">Barbearia</span> <br />
                        Elevada
                    </h1>

                    <p className="text-lg md:text-xl text-burgos-accent/70 max-w-xl leading-relaxed border-l-4 border-burgos-primary/50 pl-6">
                        Mais do que um corte, uma experiência. Visagismo, barboterapia e um ambiente exclusivo para quem valoriza sua imagem.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            href="/agendamento"
                            className="bg-burgos-primary hover:bg-burgos-primary/90 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(255,159,28,0.3)] hover:shadow-[0_0_30px_rgba(255,159,28,0.5)] transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-wide text-center"
                        >
                            Agendar Agora
                        </Link>
                        <a
                            href="#planos"
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-lg font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-wide text-center backdrop-blur-sm"
                        >
                            Conhecer Planos
                        </a>
                    </div>

                    <div className="pt-8 flex items-center gap-6 text-burgos-accent/50 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-burgos-primary"></span>
                            Taboão da Serra - SP
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-burgos-primary"></span>
                            Estacionamento Grátis
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative h-[600px] lg:h-[800px] w-full hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-l from-burgos-dark/0 via-burgos-dark/20 to-burgos-dark z-10" />
                    <Image
                        src="/hero-new.png"
                        alt="Burgos Barber Experience"
                        fill
                        className="object-contain object-center opacity-100 mix-blend-normal filter drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        priority
                    />

                    {/* Floating Card Element */}
                    <div className="absolute bottom-32 right-10 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-20 animate-float">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-burgos-primary flex items-center justify-center text-2xl">
                                ✂️
                            </div>
                            <div>
                                <p className="text-white font-bold">Visagismo</p>
                                <p className="text-xs text-white/60">Técnicas personalizadas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
