'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Header from '@/components/Header';
import NotificationForm from '@/components/notifiche/NotificationForm';
import {jwtDecode} from 'jwt-decode';

import { useAuth } from '@/contexts/AuthContext';


export default function ManageNotificationPage() {
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [initialSubscription, setInitialSubscription] = useState(null);
    const [loadingSubscription, setLoadingSubscription] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const subscriptionId = searchParams.get('id');

    // Logica per il pre-riempimento del form tramite query params
    const prefillData = !subscriptionId ? {
        fuel_type: searchParams.get('fuel_type'),
        geo_level: searchParams.get('geo_level'),
        geo_code: searchParams.get('geo_code'),
    } : null;

    // Logica di autenticazione
    const {isAuthenticated, token} = useAuth();

    // Logica per caricare la sottoscrizione se si tratta di modifica
    useEffect(() => {
        async function fetchSubscription() {
            if (!subscriptionId || !isAuthenticated) return;

            setLoadingSubscription(true);
            setError('');
            // const token = localStorage.getItem('jwt_token');

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

    return (
        <>
            <Header/>
            <div className="container my-4">
                <h1 className="text-center mb-4">{subscriptionId ? 'Modifica Notifica' : 'Crea Nuova Notifica'}</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <NotificationForm
                    initialSubscription={initialSubscription}
                    subscriptionId={subscriptionId}
                    prefillData={prefillData}
                    onSubscriptionCreated={() => router.push('/notifiche')} // Reindirizza dopo creazione/modifica
                />
            </div>
        </>
    );
}
