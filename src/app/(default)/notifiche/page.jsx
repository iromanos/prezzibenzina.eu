'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Header from '@/components/Header';
import jwtDecode from 'jwt-decode'; // Assicurati di aver installato jwt-decode

export default function NotifichePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('jwt_token'); // O da cookies, a seconda di come lo salvi
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Controlla se il token è scaduto
                if (decodedToken.exp * 1000 > Date.now()) {
                    setIsAuthenticated(true);
                } else {
                    // Token scaduto, rimuovilo
                    localStorage.removeItem('jwt_token');
                    router.push('/auth/login'); // Reindirizza al login
                }
            } catch (error) {
                console.error("Errore nella decodifica del token:", error);
                localStorage.removeItem('jwt_token');
                router.push('/auth/login'); // Reindirizza al login
            }
        } else {
            router.push('/auth/login'); // Reindirizza al login se non c'è token
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Questo non dovrebbe essere raggiunto se il reindirizzamento funziona
        return null;
    }

    return (
        <>
            <Header/>
            <div className="container my-4">
                <h1 className="text-center mb-4">Le Mie Notifiche Prezzi</h1>
                <p className="text-center lead">Qui potrai gestire le tue sottoscrizioni per ricevere avvisi sui prezzi
                    dei carburanti.</p>

                {/* Placeholder per l'elenco delle notifiche */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Le tue sottoscrizioni attive</h5>
                        <p>Nessuna notifica attiva. Crea la tua prima notifica!</p>
                        {/* Qui verrà renderizzato l'elenco dinamico delle sottoscrizioni */}
                    </div>
                </div>

                {/* Placeholder per il form di creazione nuova notifica */}
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Crea Nuova Notifica</h5>
                        <p>Il form per creare nuove notifiche verrà inserito qui.</p>
                        {/* Qui verrà renderizzato il form per creare nuove sottoscrizioni */}
                    </div>
                </div>
            </div>
        </>
    );
}