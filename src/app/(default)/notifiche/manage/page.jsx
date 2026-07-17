'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Header from '@/components/Header';
import NotificationForm from '@/components/notifiche/NotificationForm';
import {jwtDecode} from 'jwt-decode';

export default function ManageNotificationPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [initialSubscription, setInitialSubscription] = useState(null);
    const [loadingSubscription, setLoadingSubscription] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const subscriptionId = searchParams.get('id');

    // Logica di autenticazione
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('jwt_token');
                    router.push('/auth/login');
                }
            } catch (err) {
                console.error("Errore nella decodifica del token:", err);
                localStorage.removeItem('jwt_token');
                router.push('/auth/login');
            }
        } else {
            router.push('/auth/login');
        }
        setLoadingAuth(false);
    }, [router]);

    // Logica per caricare la sottoscrizione se si tratta di modifica
    useEffect(() => {
        async function fetchSubscription() {
            if (!subscriptionId || !isAuthenticated) return;

            setLoadingSubscription(true);
            setError('');
            const token = localStorage.getItem('jwt_token');

            try {
                const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
                    method: 'GET', // Avremo bisogno di un endpoint GET /api/subscriptions/:id
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Errore nel recupero della sottoscrizione.');
                }

                const data = await response.json();
                setInitialSubscription(data);
            } catch (err) {
                console.error("Errore nel caricamento della sottoscrizione:", err);
                setError(err.message || 'Impossibile caricare la sottoscrizione per la modifica.');
            } finally {
                setLoadingSubscription(false);
            }
        }

        if (isAuthenticated) {
            fetchSubscription();
        }
    }, [subscriptionId, isAuthenticated]);

    if (loadingAuth || loadingSubscription) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Reindirizzamento gestito dall'useEffect
    }

    return (
        <>
            <Header/>
            <div className="container my-4">
                <h1 className="text-center mb-4">{subscriptionId ? 'Modifica Notifica' : 'Crea Nuova Notifica'}</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <NotificationForm
                    initialSubscription={initialSubscription}
                    subscriptionId={subscriptionId}
                    onSubscriptionCreated={() => router.push('/notifiche')} // Reindirizza dopo creazione/modifica
                />
            </div>
        </>
    );
}