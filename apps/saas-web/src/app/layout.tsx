import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '../contexts/SocketContext'
import { AuthProvider } from '../contexts/AuthContext'
import { ServiceWorkerReset } from '@/components/ServiceWorkerReset';
import { TenantProvider } from '../contexts/TenantContext';

export const metadata: Metadata = {
    title: 'Loonder - Gestão de Barbearias',
    description: 'Sistema completo para gestão de barbearias e estética.',
    openGraph: {
        title: 'Barbearia Burgos | Estilo e Tradição',
        description: 'A última barbearia que você vai precisar conhecer.',
        type: 'website',
        locale: 'pt_BR',
    },
}

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" className={`${inter.variable} ${outfit.variable} `}>
            <body className="antialiased">
                <AuthProvider>
                    <ServiceWorkerReset />
                    <TenantProvider>
                        <SocketProvider>
                            {children}
                            <script
                                dangerouslySetInnerHTML={{
                                    __html: `
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }, function (err) {
            console.log('Service Worker registration failed:', err);
        });
    });
}
                                    `,
                                }}
                            />
                        </SocketProvider>
                    </TenantProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
