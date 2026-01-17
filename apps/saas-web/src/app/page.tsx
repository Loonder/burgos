'use client';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
    const { user, logout } = useAuth();
    return (
        <main className="min-h-screen bg-burgos-dark text-burgos-accent overflow-hidden font-sans selection:bg-burgos-primary selection:text-white">
            {/* TEST SYSTEM BANNER */}
            <div className="bg-red-600 text-white text-center py-2 font-bold uppercase tracking-widest text-sm z-50 relative">
                🚧 AMBIENTE DE TESTE - NÃO É A BARBEARIA REAL BURGOS 🚧
            </div>

            {/* Auth Header */}
            <div className="absolute top-0 right-0 p-6 z-50 flex gap-4">
                {user ? (
                    <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10">
                        <span className="text-white text-sm pl-2">Olá, <span className="text-burgos-primary font-bold">{user.name.split(' ')[0]}</span></span>
                        <Link href="/meus-agendamentos" className="text-xs hover:text-white text-white/70">Meus Agendamentos</Link>
                        <button onClick={logout} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-3 py-1 rounded-full transition-colors">
                            Sair
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className="bg-burgos-primary hover:bg-burgos-primary/80 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105"
                    >
                        Entrar
                    </Link>
                )}
            </div>

            <div className="container mx-auto px-4 py-16 md:py-32 relative z-10">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-fade-in relative z-20">
                        <div className="mb-6">
                            <Image
                                src="/logo-dbb.png"
                                alt="Burgos Barber"
                                width={120}
                                height={80}
                                className="h-20 w-auto"
                            />
                        </div>

                        <div className="inline-block px-3 py-1 rounded-full border border-burgos-primary/30 bg-burgos-primary/10 text-burgos-primary text-sm font-semibold tracking-wider uppercase mb-4">
                            Barbearia em Taboão da Serra / SP
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-none text-white uppercase tracking-tight">
                            A ÚLTIMA <br />
                            <span className="text-white">BARBEARIA</span> <br />
                            QUE VOCÊ VAI <br />
                            <span className="text-white">PRECISAR</span> CONHECER
                        </h1>

                        <p className="text-lg md:text-xl text-burgos-accent/70 max-w-xl leading-relaxed">
                            Chega de cortes mal feitos, esperas intermináveis e resultados que não te representam.
                            A <strong className="text-white">Barbearia Burgos</strong> elevou o conceito de barbearia para um nível que você nunca viu antes.
                        </p>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/agendamento"
                                className="inline-block bg-burgos-primary hover:bg-burgos-primary/90 text-white text-lg font-bold py-4 px-12 rounded-lg shadow-[0_0_20px_rgba(255,159,28,0.3)] hover:shadow-[0_0_30px_rgba(255,159,28,0.5)] transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-wide text-center"
                            >
                                Agendar Agora
                            </Link>
                            <Link
                                href="/meus-agendamentos"
                                className="inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-white text-lg font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-wide text-center"
                            >
                                Meus Agendamentos
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image / Graphic */}
                    <div className="relative h-[600px] lg:h-[800px] w-full hidden md:block">
                        <div className="absolute inset-0 bg-gradient-to-l from-burgos-dark/0 via-burgos-dark/20 to-burgos-dark z-10" />
                        {/* Placeholder for the 3-men profile image provided in screenshot */}
                        {/* If no image defaults, we use a gradient circle as a placeholder */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-burgos-secondary to-burgos-dark rounded-full opacity-50 blur-3xl -z-10" />
                        <Image
                            src="/hero-new.png"
                            alt="Burgos Barber Hero"
                            fill
                            className="object-contain object-center opacity-100 mix-blend-normal filter drop-shadow-[0_0_30px_rgba(255,159,28,0.3)] animate-float"
                            priority
                        />
                    </div>
                </div>

                {/* Features / Quick Access (Simplified for new design) */}
                <div className="mt-32 grid gap-6 md:grid-cols-3 border-t border-white/5 pt-16">
                    <FeatureCard
                        icon="🎵"
                        title="Música & Ambiente"
                        description="Escolha sua playlist favorita enquanto aguarda ou durante o corte."
                    />
                    <FeatureCard
                        icon="📅"
                        title="Agendamento Fácil"
                        description="Reserve seu horário em segundos pelo nosso sistema exclusivo."
                    />
                    <FeatureCard
                        icon="🍺"
                        title="Bar Aberto"
                        description="Aprecie uma cerveja gelada ou café premium por nossa conta."
                    />
                </div>
            </div>

            {/* Background Texture/Gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-burgos-secondary/40 via-burgos-dark to-burgos-dark -z-10 pointer-events-none" />
        </main>
    )
}



function FeatureCard({ icon, title, description }: {
    icon: string
    title: string
    description: string
}) {
    return (
        <div className="text-center space-y-4 p-6 rounded-xl glass-dark">
            <div className="text-4xl">{icon}</div>
            <h4 className="text-xl font-display font-semibold text-burgos-primary">{title}</h4>
            <p className="text-sm text-burgos-accent/70">{description}</p>
        </div>
    )
}
