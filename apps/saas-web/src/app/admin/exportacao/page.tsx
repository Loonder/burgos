'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Download, Users, Calendar, ShoppingBag, FileText, Loader2 } from 'lucide-react';

export default function ExportPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    const handleDownload = async (type: string, url: string, filename: string) => {
        setDownloading(type);
        try {
            const response = await api.get(url, { responseType: 'blob' });
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download error', error);
            alert('Erro ao baixar arquivo. Tente novamente.');
        } finally {
            setDownloading(null);
        }
    };

    if (isLoading) return <div className="text-white text-center p-12">Carregando...</div>;

    const cards = [
        {
            id: 'clients',
            title: 'Lista de Clientes',
            description: 'Nome, email, telefone e data de cadastro.',
            url: '/api/export/clients',
            filename: 'clientes_burgos.csv',
            icon: <Users size={32} className="text-blue-400" />
        },
        {
            id: 'appointments',
            title: 'Histórico de Agendamentos',
            description: 'Detalhes completos de serviços, horários e status.',
            url: '/api/export/appointments',
            filename: 'agendamentos_burgos.csv',
            icon: <Calendar size={32} className="text-purple-400" />
        },
        {
            id: 'transactions',
            title: 'Transações Financeiras',
            description: 'Entradas, saídas e fluxo de caixa detalhado.',
            url: '/api/export/transactions',
            filename: 'financeiro_burgos.csv',
            icon: <FileText size={32} className="text-green-400" />
        },
        {
            id: 'products',
            title: 'Catálogo de Produtos',
            description: 'Inventário atual, preços e categorias.',
            url: '/api/export/products',
            filename: 'produtos_burgos.csv',
            icon: <ShoppingBag size={32} className="text-orange-400" />
        }
    ];

    return (
        <div className="p-8 pb-32 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Download className="text-burgos-primary" /> Exportação de Dados
            </h1>
            <p className="text-burgos-accent/60 mb-8 max-w-2xl">
                Baixe relatórios completos em formato CSV para usar no Excel, Google Sheets ou importar em outros sistemas.
                <br /><strong className="text-burgos-primary">Seus dados são seus.</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card) => (
                    <div key={card.id} className="bg-burgos-secondary/20 p-6 rounded-xl border border-light-navy-100/10 hover:border-burgos-primary/50 transition-colors group">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="bg-white/5 p-4 rounded-lg group-hover:bg-white/10 transition-colors">
                                {card.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                                <p className="text-burgos-accent/60 text-sm">{card.description}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDownload(card.id, card.url, card.filename)}
                            disabled={downloading !== null}
                            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${downloading === card.id
                                    ? 'bg-white/10 text-white cursor-wait'
                                    : 'bg-burgos-primary text-white hover:opacity-90'
                                }`}
                        >
                            {downloading === card.id ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Gerando Arquivo...
                                </>
                            ) : (
                                <>
                                    <Download size={18} /> Baixar CSV
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-blue-500/10 rounded-xl border border-blue-500/30 flex items-center gap-4">
                <div className="bg-blue-500 p-2 rounded-full text-white">
                    <FileText size={20} />
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">Compatibilidade Universal</h4>
                    <p className="text-blue-200/70 text-xs">Os arquivos CSV gerados são compatíveis com Microsoft Excel, Apple Numbers, Google Sheets e a maioria dos sistemas de CRM/ERP do mercado.</p>
                </div>
            </div>
        </div>
    );
}
