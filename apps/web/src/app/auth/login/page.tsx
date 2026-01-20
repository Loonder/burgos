'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'cliente';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authAPI.login(email, password);

            // Update Auth Context (No token needed, handled via cookies)
            login(data.user);

            // Remove manual refresh token storage (handled via httpOnly cookie)
            // localStorage.removeItem('refresh_token');

            // Show Toast
            setShowToast(true);

            // Redirect based on role (or return url)
            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect');

            setTimeout(() => {
                let targetUrl = '/client';

                if (redirectUrl) {
                    targetUrl = decodeURIComponent(redirectUrl);
                } else {
                    const userRole = data.user.role;
                    if (userRole === 'admin') {
                        targetUrl = '/admin';
                    } else if (userRole === 'barbeiro') {
                        targetUrl = '/barber';
                    } else if (userRole === 'recepcionista') {
                        targetUrl = '/reception';
                    }
                }

                // Force navigation with fallback
                router.replace(targetUrl);
                // Fallback: force browser navigation if router fails
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500);
            }, 800); // Reduced wait time

        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao fazer login');
            setLoading(false); // Only stop loading on error, otherwise keep distinct loading state during redirect
        }
    };

    return (
        <div className="w-full max-w-md relative">
            {/* Success Toast */}
            {showToast && (
                <div className="absolute -top-20 left-0 right-0 bg-green-500/90 text-white p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg animate-fade-in-down border border-green-400/50 backdrop-blur-sm z-50">
                    <div className="bg-white/20 p-1 rounded-full">✓</div>
                    <span className="font-bold">Login realizado com sucesso!</span>
                </div>
            )}

            {/* Logo */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-display font-bold text-burgos-primary mb-2">
                    Barbearia Burgos
                </h1>
                <p className="text-burgos-accent/60">
                    Login - {role.charAt(0).toUpperCase() + role.slice(1)}
                </p>
            </div>

            {/* Login Form */}
            <div className="glass-dark rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-burgos-accent mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-burgos-accent mb-2">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-burgos-dark/50 border border-burgos-primary/20 text-burgos-accent focus:border-burgos-primary focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-burgos-gold-400 to-burgos-gold-500 text-burgos-dark font-semibold rounded-lg hover:from-burgos-gold-500 hover:to-burgos-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <div className="text-center">
                        <a
                            href={`/auth/register?role=${role}`}
                            className="text-sm text-burgos-primary hover:text-burgos-gold-300 transition-colors"
                        >
                            Não tem conta? Cadastre-se
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

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-burgos-dark via-burgos-secondary to-black flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-burgos-primary">Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
