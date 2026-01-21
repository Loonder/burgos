'use client';

import { Check } from 'lucide-react';

const SERVICES = [
    {
        category: "Cabelo",
        items: [
            { name: "Corte Adulto", price: "R$ 40,00" },
            { name: "Corte Infantil", price: "R$ 35,00" },
            { name: "Raspar Cabeça", price: "R$ 25,00" },
            { name: "Platinado", price: "R$ 120,00" },
            { name: "Selagem", price: "R$ 80,00" },
        ]
    },
    {
        category: "Barba",
        items: [
            { name: "Barba Completa", price: "R$ 35,00" },
            { name: "Barboterapia", price: "R$ 45,00" },
            { name: "Tonalização", price: "R$ 30,00" },
            { name: "Pezinho", price: "R$ 15,00" },
        ]
    },
    {
        category: "Estética",
        items: [
            { name: "Sobrancelha", price: "R$ 15,00" },
            { name: "Limpeza de Pele", price: "R$ 50,00" },
            { name: "Depilação Nasal", price: "R$ 10,00" },
            { name: "Hidratação", price: "R$ 30,00" },
        ]
    }
];

export function LandingServices() {
    return (
        <section id="servicos" className="py-24 bg-burgos-secondary/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-burgos-primary text-sm font-bold uppercase tracking-widest mb-4">Nossos Serviços</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-white">Menu de Serviços</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {SERVICES.map((category, idx) => (
                        <div key={idx} className="bg-burgos-dark p-8 rounded-2xl border border-white/5">
                            <h4 className="text-xl font-bold text-white mb-6 pb-2 border-b border-white/10">{category.category}</h4>
                            <div className="space-y-4">
                                {category.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <Check size={14} className="text-burgos-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-burgos-accent group-hover:text-white transition-colors">{item.name}</span>
                                        </div>
                                        <span className="text-burgos-primary font-bold">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
