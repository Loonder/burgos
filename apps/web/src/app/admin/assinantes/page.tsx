'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminSubscribersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user?.role === 'admin') {
            const fetchSubs = async () => {
                try {
                    const res = await api.get('/api/admin/plans/subscribers');
                    setSubscribers(res.data.data);
                } catch (error) {
                    console.error('Error fetching subscribers', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSubs();
        }
    }, [user]);

    if (loading || isLoading) return <div className="text-white text-center p-12">Carregando assinantes...</div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> Ativo</span>;
            case 'trialing':
                return <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full text-xs font-bold"><Clock size={12} /> Trial</span>;
            case 'canceled':
                return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> Cancelado</span>;
            default:
                return <span className="text-gray-400 bg-gray-400/10 px-2 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
        }
    };

    return (
        <div className="p-8 pb-32">
            <h1 className="text-3xl font-bold text-white mb-8">Gestão de Assinantes</h1>

            <div className="bg-burgos-secondary/20 rounded-xl overflow-hidden border border-light-navy-100/10">
                <table className="w-full text-left">
                    <thead className="bg-burgos-secondary/50 text-burgos-accent/70 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Plano</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Desde</th>
                            <th className="p-4">Renovação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-burgos-accent/50">Nenhum assinante encontrado.</td>
                            </tr>
                        ) : (
                            subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-bold text-white">{sub.user?.name || 'Usuário Removido'}</p>
                                            <p className="text-xs text-burgos-accent/50">{sub.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white">{sub.plan?.name || 'Plano Removido'}</td>
                                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                                    <td className="p-4 text-burgos-accent/70 text-sm">
                                        {new Date(sub.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-burgos-accent/70 text-sm font-mono">
                                        {new Date(sub.current_period_end).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
