'use client';

import React, {createContext, useCallback, useContext, useState} from 'react';
import {useRouter} from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children, appToken = null, initialUser = null }) {
    const [token, setToken] = useState(appToken);
    const [loading, setLoading] = useState(false); // Non più necessario un caricamento iniziale
    const router = useRouter();

    const [user, setUser] = useState(initialUser);

    const logout = useCallback(() => {
        setLoading(true);
            // Chiamata all'endpoint API che cancella il cookie
            fetch('/api/auth/logout', { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    return;
                }
                setToken(null);
                setUser(null);
                router.push('/');
                router.refresh(); // Assicura che i componenti server vengano ri-renderizzati
            }).catch(error => {
                console.error("Errore durante il logout:", error);
            }).finally(() => {
            });
    }, [router]);

    const value = {
        token,
        user: token !== null ? user : null,
        isAuthenticated: !!user,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}