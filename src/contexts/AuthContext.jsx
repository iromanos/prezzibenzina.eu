'use client';

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Funzione per caricare il token e l'utente dal localStorage
    const loadAuthData = useCallback(() => {
        try {
            const storedToken = localStorage.getItem('jwt_token');
            const storedUser = localStorage.getItem('user_data'); // Potrebbe essere un JSON dell'utente

            if (storedToken) {
                setToken(storedToken);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
                // In un'app reale, qui si potrebbe anche validare il token con un'API
            }
        } catch (error) {
            console.error("Errore nel caricamento dati autenticazione:", error);
            // Pulire dati corrotti
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAuthData();
    }, [loadAuthData]);

    const login = useCallback((newToken, userData) => {
        localStorage.setItem('jwt_token', newToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        router.push('/notifiche'); // Reindirizza dopo il login
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        router.push('/auth/login'); // Reindirizza alla pagina di login dopo il logout
    }, [router]);

    // Funzione per verificare il token (es. prima di ogni richiesta API protetta)
    const verifyToken = useCallback(async () => {
        if (!token) return false;
        // Qui andrebbe una chiamata API al backend per verificare la validità del token
        // Per ora, assumiamo che se c'è un token, è valido.
        // In un'app reale, potresti avere un endpoint tipo /api/auth/verify-token
        return true;
    }, [token]);

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        verifyToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}