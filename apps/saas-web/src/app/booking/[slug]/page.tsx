'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Calendar, Clock, Scissors } from 'lucide-react';

// Simplified Booking Page for Public Use / Embedding
export default function ExternalBookingPage() {
    const params = useParams();
    const slug = params.slug;

    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load Tenant Data by Slug
        const load = async () => {
            try {
                // In production, this would hit /api/tenants/public/:slug
                // Mocking response for demo
                setTenant({
                    name: slug === 'burgos' ? 'Burgos Barbearia' : 'Barbearia Demo',
                    logo_url: '/logo.png',
                    primary_color: '#D4AF37'
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Carregando...</div>;
    if (!tenant) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Barbearia não encontrada.</div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Minimalist Header */}
            <header className="p-4 border-b border-white/10 flex items-center justify-center bg-zinc-900">
                <span className="font-bold text-lg">{tenant.name}</span>
            </header>

            {/* Booking Flow (Simplified) */}
            <main className="max-w-md mx-auto p-6 space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Agende seu horário</h1>
                    <p className="text-gray-400 text-sm">Selecione o serviço abaixo</p>
                </div>

                {/* Service Selection Mock */}
                <div className="space-y-3">
                    {['Corte de Cabelo', 'Barba Completa', 'Combo (Corte + Barba)'].map((service, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors border border-white/5 hover:border-white/20">
                            <div className="flex items-center gap-3">
                                <Scissors size={18} style={{ color: tenant.primary_color }} />
                                <span>{service}</span>
                            </div>
                            <span className="font-bold text-sm">R$ {40 + (i * 15)},00</span>
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-500">
                    <p>Powered by <strong>Loonder</strong></p>
                </div>
            </main>
        </div>
    );
}
