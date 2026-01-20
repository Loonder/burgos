'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard } from 'lucide-react';

export default function FinancialDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // 1st of month
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user, dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, transactionsRes] = await Promise.all([
                api.get(`/api/financial/summary?startDate=${dateRange.start}&endDate=${dateRange.end}`),
                api.get(`/api/financial/transactions?startDate=${dateRange.start}&endDate=${dateRange.end}&limit=20`)
            ]);
            setSummary(summaryRes.data);
            setTransactions(transactionsRes.data.data);
        } catch (error) {
            console.error('Error fetching financial data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || isLoading) return <div className="text-white text-center p-12">Carregando financeiro...</div>;

    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <DollarSign className="text-burgos-primary" /> Financeiro
                </h1>

                <div className="flex items-center gap-2 bg-burgos-secondary/30 p-2 rounded-lg border border-white/5">
                    <Calendar size={16} className="text-burgos-accent/70" />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-transparent text-white text-sm outline-none"
                    />
                    <span className="text-burgos-accent/50">-</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-transparent text-white text-sm outline-none"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard
                    title="Receita Total"
                    value={summary?.totalIncome}
                    icon={<TrendingUp size={24} className="text-green-400" />}
                    color="text-green-400"
                />
                <SummaryCard
                    title="Despesas"
                    value={summary?.totalExpenses}
                    icon={<TrendingDown size={24} className="text-red-400" />}
                    color="text-red-400"
                />
                <SummaryCard
                    title="Saldo Líquido"
                    value={summary?.balance}
                    icon={<DollarSign size={24} className="text-burgos-primary" />}
                    color="text-burgos-primary"
                />
                <SummaryCard
                    title="Ticket Médio"
                    value={summary?.ticketMedio}
                    sub={`Em ${summary?.appointmentsCount} agendamentos`}
                    icon={<CreditCard size={24} className="text-blue-400" />}
                    color="text-blue-400"
                />
            </div>

            {/* Transactions Table */}
            <div className="bg-burgos-secondary/20 rounded-xl overflow-hidden border border-light-navy-100/10">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Últimas Transações</h2>
                    <button className="text-sm text-burgos-primary hover:text-white transition-colors">Ver todas</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-burgos-secondary/50 text-burgos-accent/70 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Método</th>
                                <th className="p-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-burgos-accent/50">Nenhuma transação encontrada.</td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-burgos-accent/70 text-sm">
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-white font-medium">
                                            {t.description || 'Sem descrição'}
                                            {t.barber && <span className="block text-xs text-burgos-accent/50">Barbeiro: {t.barber.name}</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-white/5 px-2 py-1 rounded text-xs text-burgos-accent/80 capitalize">{t.category}</span>
                                        </td>
                                        <td className="p-4 text-sm text-burgos-accent/70 capitalize">
                                            {t.payment_method || '-'}
                                        </td>
                                        <td className={`p-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, color, sub }: any) {
    return (
        <div className="bg-burgos-secondary/20 p-6 rounded-xl border border-light-navy-100/10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-burgos-accent/60 text-sm uppercase tracking-wider mb-1">{title}</p>
                    <h3 className={`text-2xl font-bold ${color}`}>
                        R$ {Number(value || 0).toFixed(2)}
                    </h3>
                    {sub && <p className="text-xs text-burgos-accent/40 mt-1">{sub}</p>}
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
}
