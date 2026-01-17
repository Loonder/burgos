'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Configure axios globally to include cookies
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
    id: string;
    email: string;
    role: string;
    name: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void; // Login now only needs to set the user state locally
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Init session from server cookie
        const checkSession = async () => {
            try {
                const { data } = await axios.get('/api/auth/me');
                setUser(data);
            } catch (error) {
                // Not logged in or session expired
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        // Cookies are set by the server response header automatically
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        }
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
