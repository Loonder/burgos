import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Enable cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor removed as cookies are handled automatically

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post('/api/auth/login', { email, password });
        return response.data;
    },

    register: async (data: { email: string; password: string; name: string; phone?: string; birthDate?: string }) => {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    },

    me: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/api/auth/refresh');
        return response.data;
    },
};

// Subscription API
export const subscriptionAPI = {
    getPlans: async () => {
        const response = await api.get('/api/subscriptions/plans');
        return response.data;
    },

    getMySubscription: async () => {
        const response = await api.get('/api/subscriptions/me');
        return response.data;
    },

    checkPrice: async (serviceId: string, originalPrice: number) => {
        const response = await api.post('/api/subscriptions/check-price', { serviceId, originalPrice });
        return response.data;
    },

    createCheckoutSession: async (planId: string, successUrl: string, cancelUrl: string) => {
        const response = await api.post('/api/subscriptions/checkout', { planId, successUrl, cancelUrl });
        return response.data;
    },

    mockActivate: async (planId: string) => {
        const response = await api.post('/api/subscriptions/mock-activate', { planId });
        return response.data;
    }
};
