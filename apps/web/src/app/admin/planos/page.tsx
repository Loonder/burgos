'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPlansPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [plans, setPlans] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<any>({ name: '', description: '', price: 0, discounts: [] });

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    const fetchData = async () => {
        try {
            const [plansRes, servicesRes] = await Promise.all([
                api.get('/api/admin/plans'),
                api.get('/api/services')
            ]);
            setPlans(plansRes.data.data);
            setServices(servicesRes.data.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const handleSave = async () => {
        try {
            if (currentPlan.id) {
                await api.put(`/api/admin/plans/${currentPlan.id}`, currentPlan);
            } else {
                await api.post('/api/admin/plans', currentPlan);
            }
            setIsEditing(false);
            setCurrentPlan({ name: '', description: '', price: 0, discounts: [] });
            fetchData();
        } catch (error) {
            alert('Erro ao salvar plano');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este plano?')) return;
        try {
            await api.delete(`/api/admin/plans/${id}`);
            fetchData();
        } catch (error) {
            alert('Erro ao excluir plano');
        }
    };

    const toggleDiscount = (serviceId: string) => {
        const discounts = [...(currentPlan.discounts || [])];
        const index = discounts.findIndex((d: any) => d.service_id === serviceId);

        if (index >= 0) {
            discounts.splice(index, 1);
        } else {
            discounts.push({ service_id: serviceId, is_free: true, discount_percentage: 0 });
        }
        setCurrentPlan({ ...currentPlan, discounts });
    };

    if (loading || isLoading) return <div className="text-white text-center p-12">Carregando...</div>;

    return (
        <div className="p-8 pb-32">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Gerenciar Planos</h1>
                <button
                    onClick={() => {
                        setCurrentPlan({ name: '', description: '', price: 0, discounts: [] });
                        setIsEditing(true);
                    }}
                    className="bg-burgos-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                >
                    <Plus size={20} /> Novo Plano
                </button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-burgos-secondary p-8 rounded-2xl w-full max-w-2xl border border-burgos-primary/30 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">{currentPlan.id ? 'Editar Plano' : 'Novo Plano'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-burgos-accent/70 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={currentPlan.name}
                                    onChange={e => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-burgos-accent/70 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={currentPlan.description}
                                    onChange={e => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-burgos-accent/70 mb-1">Preço (R$)</label>
                                <input
                                    type="number"
                                    value={currentPlan.price}
                                    onChange={e => setCurrentPlan({ ...currentPlan, price: Number(e.target.value) })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-burgos-accent/70 mb-2 font-bold mt-4">Configurar Descontos por Serviço</label>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {services.map(service => {
                                        const discount = currentPlan.discounts?.find((d: any) => d.service_id === service.id);
                                        const isFree = discount?.is_free || false;
                                        const percentage = discount?.discount_percentage || 0;

                                        return (
                                            <div
                                                key={service.id}
                                                className="p-3 rounded-lg border bg-burgos-dark border-white/10 flex items-center justify-between gap-3"
                                            >
                                                <span className="text-white text-sm flex-1">{service.name}</span>
                                                <div className="flex items-center gap-2">
                                                    {/* FREE Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const discounts = [...(currentPlan.discounts || [])];
                                                            const index = discounts.findIndex((d: any) => d.service_id === service.id);
                                                            if (isFree) {
                                                                // Remove
                                                                if (index >= 0) discounts.splice(index, 1);
                                                            } else {
                                                                // Add as free
                                                                if (index >= 0) {
                                                                    discounts[index] = { ...discounts[index], is_free: true, discount_percentage: 0 };
                                                                } else {
                                                                    discounts.push({ service_id: service.id, is_free: true, discount_percentage: 0 });
                                                                }
                                                            }
                                                            setCurrentPlan({ ...currentPlan, discounts });
                                                        }}
                                                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${isFree
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-white/10 text-white/50 hover:bg-white/20'
                                                            }`}
                                                    >
                                                        🥷 GRÁTIS
                                                    </button>

                                                    {/* Percentage Input */}
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={isFree ? '' : percentage}
                                                            disabled={isFree}
                                                            onChange={(e) => {
                                                                const pct = Number(e.target.value);
                                                                const discounts = [...(currentPlan.discounts || [])];
                                                                const index = discounts.findIndex((d: any) => d.service_id === service.id);
                                                                if (pct > 0) {
                                                                    if (index >= 0) {
                                                                        discounts[index] = { ...discounts[index], is_free: false, discount_percentage: pct };
                                                                    } else {
                                                                        discounts.push({ service_id: service.id, is_free: false, discount_percentage: pct });
                                                                    }
                                                                } else {
                                                                    if (index >= 0) discounts.splice(index, 1);
                                                                }
                                                                setCurrentPlan({ ...currentPlan, discounts });
                                                            }}
                                                            placeholder="0"
                                                            className="w-14 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-center text-sm disabled:opacity-30"
                                                        />
                                                        <span className="text-white/50 text-sm">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-burgos-accent/50 mt-2">Selecione "GRÁTIS" para 100% off ou defina uma % de desconto.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 rounded-lg bg-burgos-primary text-white hover:bg-opacity-90 flex items-center gap-2"
                            >
                                <Save size={18} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-burgos-secondary/20 p-6 rounded-xl border border-light-navy-100/10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setCurrentPlan(plan);
                                        setIsEditing(true);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-burgos-primary"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <p className="text-burgos-accent/70 text-sm mb-4 h-10 line-clamp-2">{plan.description}</p>
                        <p className="text-2xl font-bold text-white mb-4">R$ {plan.price.toFixed(2)}</p>
                        <div className="text-sm text-burgos-accent/50">
                            {plan.discounts?.length || 0} serviços inclusos
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CheckCircleIcon() {
    return (
        <svg className="w-5 h-5 text-burgos-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );
}
