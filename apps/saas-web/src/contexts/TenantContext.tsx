'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Tenant {
    id: string;
    slug: string;
    name: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    plan_tier: 'basic' | 'pro' | 'war';
}

interface TenantContextType {
    tenant: Tenant | null;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({ tenant: null, isLoading: true });

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTenant = async () => {
            // Logic to detect tenant from Subdomain
            // For dev/demo, we might use a query param or default to 'burgos'
            // const hostname = window.location.hostname;
            // const subdomain = hostname.split('.')[0];

            // Mock for now:
            const subdomain = 'burgos';

            try {
                // 1. Try to fetch from Authenticated User (Admin View)
                const token = localStorage.getItem('token'); // Simplification, ideally use AuthContext
                if (token) {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const realTenant = await res.json();
                        setTenant(realTenant);
                        document.documentElement.style.setProperty('--primary', realTenant.primary_color || '#D4AF37');
                        setIsLoading(false);
                        return;
                    }
                }

                // 2. Fallback: Check for public slug (for booking pages)
                // const start = window.location.pathname.startsWith('/booking/');
                // ... logic for public slug

                // 3. Fallback to Burgos (Mock/Default) if nothing else
                console.log("Using Default Tenant (Burgos)");
                const mockTenant: Tenant = {
                    id: 'default',
                    slug: 'burgos',
                    name: 'Burgos Barbearia (Geral)',
                    logo_url: '',
                    primary_color: '#D4AF37',
                    secondary_color: '#000000',
                    plan_tier: 'war'
                };
                setTenant(mockTenant);
                document.documentElement.style.setProperty('--primary', mockTenant.primary_color);

            } catch (error) {
                console.error("Failed to load tenant", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTenant();
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
}

export const useTenant = () => useContext(TenantContext);
