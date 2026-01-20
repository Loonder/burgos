'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Check, ShoppingBag } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
}

interface ProductSelectionProps {
    serviceId: string | null;
    selectedProducts: string[];
    onToggleProduct: (productId: string, price: number) => void;
    onContinue: () => void;
    onSkip: () => void;
}

export function ProductSelection({ serviceId, selectedProducts, onToggleProduct, onContinue, onSkip }: ProductSelectionProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products shown on booking, optionally prioritize by serviceId
                const url = serviceId
                    ? `/api/products?showOnBooking=true&serviceId=${serviceId}`
                    : '/api/products?showOnBooking=true';

                const res = await api.get(url);
                setProducts(res.data.data || []);
            } catch (error) {
                console.error('Error fetching products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [serviceId]);

    // If no products available, auto-skip this step
    useEffect(() => {
        if (!loading && products.length === 0) {
            onSkip();
        }
    }, [loading, products, onSkip]);

    if (loading) return <div className="text-center py-12 text-white">Carregando sugestões...</div>;

    if (products.length === 0) {
        return null; // Or render nothing
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-center">
                Algo a mais?
            </h1>
            <p className="text-burgos-accent/60 text-center mb-12 text-lg">
                Produtos selecionados para complementar sua experiência.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {products.map((product) => {
                    const isSelected = selectedProducts.includes(product.id);
                    return (
                        <div
                            key={product.id}
                            onClick={() => onToggleProduct(product.id, product.price)}
                            className={`
                                cursor-pointer group relative overflow-hidden rounded-2xl border transition-all duration-300
                                ${isSelected
                                    ? 'bg-burgos-primary/10 border-burgos-primary'
                                    : 'bg-burgos-secondary/20 border-light-navy-100/10 hover:border-burgos-primary/50'
                                }
                            `}
                        >
                            <div className="aspect-video bg-burgos-dark relative overflow-hidden">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <ShoppingBag size={32} className="text-white/20" />
                                    </div>
                                )}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-burgos-primary/40 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                                        <div className="bg-white text-burgos-primary rounded-full p-2 text-2xl font-bold shadow-lg">
                                            <Check size={24} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white text-lg">{product.name}</h3>
                                    <span className="font-mono text-burgos-primary font-bold">
                                        R$ {product.price.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-sm text-burgos-accent/60 line-clamp-2">{product.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={onSkip}
                    className="px-8 py-4 rounded-full font-bold text-burgos-accent/60 hover:text-white transition-colors uppercase tracking-wider text-sm"
                >
                    Pular esta etapa
                </button>
                <button
                    onClick={onContinue}
                    className="px-12 py-4 rounded-full font-bold text-lg uppercase tracking-wider bg-burgos-primary text-white hover:shadow-[0_0_20px_rgba(255,159,28,0.4)] hover:-translate-y-1 transition-all"
                >
                    Continuar {selectedProducts.length > 0 && `(${selectedProducts.length})`}
                </button>
            </div>
        </div>
    );
}
