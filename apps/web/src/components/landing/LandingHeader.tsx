'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

export function LandingHeader() {
    const { user, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-burgos-dark/95 backdrop-blur-md shadow-lg py-1' : 'bg-transparent py-4'
                }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="relative z-50">
                    <Image
                        src="/logo-dbb.png"
                        alt="Burgos Barber"
                        width={200}
                        height={200}
                        className="h-14 md:h-16 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <button onClick={() => scrollToSection('sobre')} className="text-burgos-accent hover:text-burgos-primary transition-colors text-sm font-medium uppercase tracking-wide">Sobre</button>
                    <button onClick={() => scrollToSection('servicos')} className="text-burgos-accent hover:text-burgos-primary transition-colors text-sm font-medium uppercase tracking-wide">Serviços</button>
                    <button onClick={() => scrollToSection('planos')} className="text-burgos-accent hover:text-burgos-primary transition-colors text-sm font-medium uppercase tracking-wide">Planos</button>
                    <button onClick={() => scrollToSection('localizacao')} className="text-burgos-accent hover:text-burgos-primary transition-colors text-sm font-medium uppercase tracking-wide">Localização</button>
                </nav>

                {/* Auth/Action Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 bg-white/5 p-1 pr-4 pl-2 rounded-full border border-white/10">
                                <span className="text-white text-xs pl-2">Olá, <span className="text-burgos-primary font-bold">{user.name.split(' ')[0]}</span></span>
                                <Link href="/meus-agendamentos" className="text-xs hover:text-white text-white/70">Painel</Link>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Sair da conta"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/auth/login" className="text-white hover:text-burgos-primary font-medium text-sm">Entrar</Link>
                            <Link
                                href="/agendamento"
                                className="bg-burgos-primary hover:bg-burgos-primary/80 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 text-sm uppercase"
                            >
                                Agendar
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 bg-burgos-dark/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 md:hidden">
                        <button onClick={() => scrollToSection('sobre')} className="text-2xl text-white font-bold">Sobre</button>
                        <button onClick={() => scrollToSection('servicos')} className="text-2xl text-white font-bold">Serviços</button>
                        <button onClick={() => scrollToSection('planos')} className="text-2xl text-white font-bold">Planos</button>
                        <button onClick={() => scrollToSection('localizacao')} className="text-2xl text-white font-bold">Localização</button>

                        <div className="h-px w-24 bg-white/10 my-8"></div>

                        {user ? (
                            <>
                                <Link href="/meus-agendamentos" className="text-xl text-burgos-primary font-bold">Meu Painel</Link>
                                <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="text-xl text-red-400 flex items-center gap-2"
                                >
                                    <LogOut size={20} /> Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-xl text-white">Entrar</Link>
                                <Link
                                    href="/agendamento"
                                    className="bg-burgos-primary text-white font-bold py-3 px-8 rounded-full text-xl"
                                >
                                    Agendar Agora
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
