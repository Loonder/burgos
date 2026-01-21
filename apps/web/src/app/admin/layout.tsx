'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Scissors, Settings, LogOut, Package, Trophy, Target, Crown, BadgeDollarSign, Download, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

// Staff roles that can access admin
const STAFF_ROLES = ['admin', 'barbeiro', 'recepcionista'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Skip checks for login page
        if (pathname === '/admin/login') return;

        if (!isLoading) {
            // Not authenticated - redirect to login
            if (!user) {
                router.push('/admin/login');
                return;
            }

            // CRITICAL SECURITY: Verify user has staff role
            if (!STAFF_ROLES.includes(user.role)) {
                console.warn(`Access denied: User ${user.email} with role ${user.role} tried to access admin`);
                router.push('/');
                return;
            }
        }
    }, [isLoading, user, pathname, router]);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // If on login page, just render children (the login form)
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // If loading, show spinner
    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-burgos-primary">Carregando...</div>;
    }

    // If not authenticated or not staff, show nothing (redirect will happen)
    if (!user || !STAFF_ROLES.includes(user.role)) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-burgos-primary">Verificando permissões...</div>;
    }

    const menu = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Profissionais', href: '/admin/barbers', icon: Users },
        { name: 'Serviços', href: '/admin/services', icon: Scissors },
        { name: 'Ranking Team', href: '/admin/gamificacao', icon: Trophy },
        { name: 'Missões', href: '/admin/missoes', icon: Target },
        { name: 'Planos VIP', href: '/admin/planos', icon: Crown },
        { name: 'Assinantes', href: '/admin/assinantes', icon: Users },
        { name: 'Financeiro', href: '/admin/financeiro', icon: BadgeDollarSign },
        { name: 'Loja', href: '/admin/produtos', icon: Package },
        { name: 'Exportar Dados', href: '/admin/exportacao', icon: Download },
        { name: 'Configurações', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-burgos-dark flex relative">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-black/95 lg:bg-black/40 border-r border-white/5 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 lg:p-8 flex items-center justify-between">
                    <h1 className="text-xl lg:text-2xl font-display font-bold text-burgos-primary">
                        Burgos<span className="text-white">Admin</span>
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 text-white/60 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-3 lg:px-4 space-y-1 lg:space-y-2 overflow-y-auto">
                    {menu.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all text-sm lg:text-base ${isActive
                                    ? 'bg-burgos-primary text-black font-bold'
                                    : 'text-burgos-text hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} className="lg:w-5 lg:h-5 flex-shrink-0" />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 lg:p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full rounded-xl transition-all text-sm lg:text-base"
                    >
                        <LogOut size={18} className="lg:w-5 lg:h-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full">
                <header className="h-14 lg:h-20 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="text-base lg:text-xl font-bold text-white truncate">
                            {menu.find(i => i.href === pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-white font-bold text-xs lg:text-sm truncate max-w-[120px] lg:max-w-none">{user.name}</p>
                            <p className="text-burgos-text text-xs uppercase">{user.role}</p>
                        </div>
                        <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-burgos-primary flex items-center justify-center text-burgos-dark font-bold text-sm lg:text-lg flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
