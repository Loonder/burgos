'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash, Edit2, Scissors } from 'lucide-react';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 30
    });

    const fetchServices = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);
            setServices(res.data.data);
        } catch (error) {
            console.error('Failed to load services', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, formData);
            setIsFormOpen(false);
            fetchServices();
            setFormData({ name: '', description: '', price: 0, duration_minutes: 30 });
        } catch (error) {
            alert('Error creating service');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`);
            fetchServices();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Scissors className="text-burgos-primary" />
                    Gerenciar Serviços
                </h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-burgos-primary hover:bg-burgos-light text-burgos-dark px-4 py-2 rounded-xl font-bold transition-all"
                >
                    <Plus size={20} />
                    Novo Serviço
                </button>
            </div>

            {/* Creation Form (Inline for MVP) */}
            {isFormOpen && (
                <div className="glass-dark p-6 rounded-2xl border border-white/10 animate-fade-in-down">
                    <h3 className="text-white font-bold mb-4">Novo Serviço</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Nome do Serviço"
                            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Descrição"
                            className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="flex gap-4">
                            <input
                                type="number"
                                placeholder="Preço (R$)"
                                className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none w-full"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Duração (min)"
                                className="bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-burgos-primary outline-none w-full"
                                value={formData.duration_minutes}
                                onChange={e => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white px-4 py-2">Cancelar</button>
                            <button type="submit" className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-lg">Salvar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Services List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div key={service.id} className="glass-dark p-6 rounded-2xl border border-white/5 hover:border-burgos-primary/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 rounded-xl bg-burgos-primary/10 flex items-center justify-center text-burgos-primary">
                                <Scissors size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-burgos-text hover:text-white">
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
                        <p className="text-burgos-accent text-sm mb-4 h-10 line-clamp-2">{service.description}</p>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <span className="text-burgos-primary font-bold text-lg">
                                R$ {Number(service.price).toFixed(2)}
                            </span>
                            <span className="text-xs text-burgos-text bg-white/5 px-2 py-1 rounded-full">
                                {service.duration_minutes} min
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
