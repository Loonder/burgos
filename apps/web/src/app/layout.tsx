import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '../contexts/SocketContext'
import { AuthProvider } from '../contexts/AuthContext'

export const metadata: Metadata = {
    title: 'Barbearia Burgos | A Melhor Experiência em Taboão da Serra',
    description: 'Agende seu corte na Barbearia Burgos. Cortes modernos, ambiente premium, bar aberto e música de qualidade. Localizado em Taboão da Serra/SP.',
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
                    <SocketProvider>
                        {children}
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('ServiceWorker registration successful');
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
`,
                            }}
                        />
                    </SocketProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
