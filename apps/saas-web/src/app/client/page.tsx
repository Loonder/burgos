'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ClientDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-burgos-dark via-burgos-secondary to-black p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-display font-bold text-burgos-primary">
                        Área do Cliente
                    </h1>
                    <div className="flex gap-4">
                        <Link href="/" className="px-6 py-2 rounded-full border border-burgos-primary/30 text-burgos-primary hover:bg-burgos-primary/10 transition-colors">
                            Voltar ao Início
                        </Link>
                        <button onClick={logout} className="px-6 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                            Sair
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Welcome Card */}
                    <div className="glass-dark rounded-2xl p-8 border border-white/5">
                        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo, {user?.name}!</h2>
                        <p className="text-burgos-accent/70 mb-6">
                            Estamos felizes em vê-lo por aqui. O que deseja fazer hoje?
                        </p>
                        <Link
                            href="/agendamento"
                            className="inline-block w-full text-center bg-burgos-primary text-white font-bold py-3 rounded-xl hover:bg-burgos-primary/90 transition-colors"
                        >
                            Novo Agendamento
                        </Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-dark rounded-2xl p-8 border border-white/5">
                        <h2 className="text-2xl font-bold text-white mb-4">Acesso Rápido</h2>
                        <div className="space-y-4">
                            <Link
                                href="/meus-agendamentos"
                                className="block w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-center text-burgos-accent"
                            >
                                Meus Agendamentos
                            </Link>
                            <button className="block w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-center text-burgos-accent opacity-50 cursor-not-allowed">
                                Histórico de Cortes (Em breve)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
