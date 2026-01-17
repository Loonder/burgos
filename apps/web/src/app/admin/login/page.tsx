
'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { Lock, Mail, Loader2 } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
            const res = await axios.post(`${URL}/api/auth/login`, {
                email,
                password
            });

            // Login function will redirect to /admin logic inside context or we push here (context doesn't push anymore? context doesn't push. check.)
            // The context login function just sets state. We need to handle redirect or rely on the state change.
            // Wait, previous file `auth\login\page.tsx` was handling redirect. This one says comment "Login function will redirect to /admin".
            // AuthContext `login` implementation: `setUser(newUser)`. No redirect.
            // So we need to push here. But first let's fix the type error.
            login(res.data.user);
            // Manually redirect
            if (res.data.user.role === 'admin') {
                window.location.href = '/admin'; // Force reload or router.push
            } else {
                setError('Acesso negado. Você não é administrador.');
                // logout could be triggered here to clear cookies if needed
            }
        } catch (err: any) {
            console.error('Login failed', err);
            setError(err.response?.data?.error || 'Falha ao entrar. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-burgos-dark border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in-up">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-burgos-primary mb-2">Burgos<span className="text-white">Admin</span></h1>
                    <p className="text-burgos-text">Área restrita para administradores</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-burgos-text" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-burgos-primary outline-none transition-all"
                                placeholder="admin@burgos.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-burgos-text" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-burgos-primary outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-burgos-primary hover:bg-burgos-light text-burgos-dark font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-burgos-text/50">
                    &copy; 2026 Barbearia Burgos. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
}
