'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Save, Package } from 'lucide-react';

export default function AdminProductsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>({ name: '', description: '', price: 0, stock: 0, show_on_booking: true });

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/api/products/admin');
            setProducts(res.data.data || []);
        } catch (error) {
            console.error('Error fetching products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchProducts();
        }
    }, [user]);

    const handleSave = async () => {
        try {
            if (currentProduct.id) {
                await api.put(`/api/products/admin/${currentProduct.id}`, currentProduct);
            } else {
                await api.post('/api/products/admin', currentProduct);
            }
            setIsEditing(false);
            setCurrentProduct({ name: '', description: '', price: 0, stock: 0, show_on_booking: true });
            fetchProducts();
        } catch (error) {
            alert('Erro ao salvar produto');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        try {
            await api.delete(`/api/products/admin/${id}`);
            fetchProducts();
        } catch (error) {
            alert('Erro ao excluir produto');
        }
    };

    if (loading || isLoading) return <div className="text-white text-center p-12">Carregando...</div>;

    return (
        <div className="px-4 lg:p-8 pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 lg:mb-8">
                <h1 className="text-xl lg:text-3xl font-bold text-white flex items-center gap-2 lg:gap-3">
                    <Package className="text-burgos-primary w-6 h-6 lg:w-8 lg:h-8" /> Loja de Produtos
                </h1>
                <button
                    onClick={() => {
                        setCurrentProduct({ name: '', description: '', price: 0, stock: 0, show_on_booking: true });
                        setIsEditing(true);
                    }}
                    className="bg-burgos-primary text-white px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 text-sm lg:text-base"
                >
                    <Plus size={18} className="lg:w-5 lg:h-5" />
                    <span className="hidden sm:inline">Novo Produto</span>
                    <span className="sm:hidden">Adicionar</span>
                </button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-burgos-secondary p-8 rounded-2xl w-full max-w-lg border border-burgos-primary/30">
                        <h2 className="text-2xl font-bold text-white mb-6">{currentProduct.id ? 'Editar Produto' : 'Novo Produto'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-burgos-accent/70 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={currentProduct.name}
                                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                    placeholder="Ex: Pomada Modeladora"
                                />
                            </div>
                            <div>
                                <label className="block text-burgos-accent/70 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={currentProduct.description}
                                    onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                    placeholder="Fixação forte, acabamento matte..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-burgos-accent/70 mb-1">Preço (R$)</label>
                                    <input
                                        type="number"
                                        value={currentProduct.price}
                                        onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                                        className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-burgos-accent/70 mb-1">Estoque</label>
                                    <input
                                        type="number"
                                        value={currentProduct.stock}
                                        onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                                        className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-burgos-accent/70 mb-1">URL da Imagem</label>
                                <input
                                    type="text"
                                    value={currentProduct.image || ''}
                                    onChange={e => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                                    className="w-full bg-burgos-dark border border-white/10 rounded-lg p-3 text-white"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={currentProduct.show_on_booking}
                                    onChange={e => setCurrentProduct({ ...currentProduct, show_on_booking: e.target.checked })}
                                    className="w-5 h-5 accent-burgos-primary"
                                />
                                <label className="text-white">Mostrar como sugestão no agendamento</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5">
                                Cancelar
                            </button>
                            <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-burgos-primary text-white hover:bg-opacity-90 flex items-center gap-2">
                                <Save size={18} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-burgos-secondary/20 rounded-xl border border-light-navy-100/10 overflow-hidden group">
                        <div className="h-28 lg:h-40 bg-burgos-dark flex items-center justify-center">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <Package size={32} className="lg:w-12 lg:h-12 text-burgos-accent/20" />
                            )}
                        </div>
                        <div className="p-3 lg:p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white text-sm lg:text-base truncate">{product.name}</h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setCurrentProduct(product); setIsEditing(true); }} className="p-1 hover:bg-white/10 rounded text-burgos-primary">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="p-1 hover:bg-white/10 rounded text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-burgos-accent/60 text-xs lg:text-sm mb-2 lg:mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm lg:text-lg font-bold text-burgos-primary">R$ {product.price?.toFixed(2)}</span>
                                <span className="text-[10px] lg:text-xs text-burgos-accent/50">{product.stock} em estoque</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
