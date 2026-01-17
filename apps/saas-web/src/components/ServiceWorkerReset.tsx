'use client';

import { useEffect } from 'react';

export function ServiceWorkerReset() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                    console.log('Service Worker Unregistered (SaaS Reset)');
                }
            });
        }
    }, []);

    return null;
}
