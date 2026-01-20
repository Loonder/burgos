'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Scissors, Settings, LogOut, Calendar, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // If not loading and not authenticated, redirect to login
        // Except if already on login page
        if (!isLoading && !user && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [isLoading, user, pathname, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // If on login page, just render children (the login form)
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // If loading or not user (and not on login), show nothing/spinner
    if (isLoading || !user) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-burgos-primary">Carregando...</div>;
    }

    const menu = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Profissionais', href: '/admin/barbers', icon: Users },
        { name: 'Serviços', href: '/admin/services', icon: Scissors },
        { name: 'Configurações', href: '/admin/settings', icon: Settings },
        { name: 'Baixar App', href: '/downloads/Burgos Reception 1.0.0.exe', icon: Calendar }, // Using Calendar icon as placeholder
    ];

    return (
        <div className="min-h-screen bg-burgos-dark flex relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    w-64 bg-black/90 md:bg-black/40 border-r border-white/5 flex flex-col 
                    fixed md:static inset-y-0 left-0 z-50 
                    transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-8 flex items-center justify-between">
                    <h1 className="text-2xl font-display font-bold text-burgos-primary">
                        Burgos<span className="text-white">Admin</span>
                    </h1>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {menu.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-burgos-primary text-black font-bold'
                                    : 'text-burgos-text hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {item.name === 'Baixar App' ? (
                                    <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                        Loonder
                                    </div>
                                ) : (
                                    <item.icon size={20} />
                                )}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col min-w-0">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-white md:hidden p-2 hover:bg-white/5 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-white truncate">
                            {menu.find(i => i.href === pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-white font-bold text-sm">{user.name}</p>
                            <p className="text-burgos-text text-xs uppercase">{user.role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-burgos-primary flex items-center justify-center text-burgos-dark font-bold text-lg shrink-0">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="p-4 md:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
