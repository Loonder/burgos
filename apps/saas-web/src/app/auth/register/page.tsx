'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'cliente';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                birthDate: formData.birthDate,
                password: formData.password,
            });

            // Redirect to login
            router.push(`/auth/login?role=${role}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-display font-bold text-burgos-primary mb-2">
                    Barbearia Burgos
                </h1>
                <p className="text-burgos-accent/60">
                    Cadastro - {role.charAt(0).toUpperCase() + role.slice(1)}
                </p>
            </div>

            {/* Register Form */}
            <div className="glass-dark rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-burgos-accent mb-2">
                            Nome Completo
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                            placeholder="Seu nome"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-burgos-accent mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-burgos-accent mb-2">
                            Telefone (opcional)
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-burgos-accent mb-2">
                            Data de Nascimento
                        </label>
                        <input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-burgos-accent mb-2">
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-burgos-accent mb-2">
                            Confirmar Senha
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                            placeholder="Digite a senha novamente"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-burgos-gold-400 to-burgos-gold-500 text-burgos-dark font-semibold rounded-lg hover:from-burgos-gold-500 hover:to-burgos-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </button>

                    <div className="text-center">
                        <a
                            href={`/auth/login?role=${role}`}
                            className="text-sm text-burgos-primary hover:text-burgos-gold-300 transition-colors"
                        >
                            Já tem conta? Faça login
                        </a>
                    </div>
                </form>
            </div>

            <div className="mt-6 text-center">
                <a href="/" className="text-sm text-burgos-accent/60 hover:text-burgos-accent transition-colors">
                    ← Voltar
                </a>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-burgos-dark via-burgos-secondary to-black flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-burgos-primary">Carregando...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
