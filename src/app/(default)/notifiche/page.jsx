'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Header from '@/components/Header';
import {jwtDecode} from "jwt-decode";
import SubscriptionItem from '@/components/notifiche/SubscriptionItem'; // Importa il componente SubscriptionItem
import Link from 'next/link'; // Importa Link per il pulsante "Crea Notifica"
import {FaPlus} from 'react-icons/fa'; // Icona per il pulsante

export default function NotifichePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState([]); // Stato per le sottoscrizioni
    const [fetchError, setFetchError] = useState(''); // Stato per errori nel fetching delle sottoscrizioni
    const router = useRouter();

    // Funzione per recuperare le sottoscrizioni dell'utente
    const fetchSubscriptions = useCallback(async () => {
        setFetchError('');
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        try {
            const response = await fetch('/api/subscriptions/list', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const message = errorData.error || 'Errore nel recupero delle sottoscrizioni.';
                console.error("Errore API:", message);
                setFetchError(message);
                return;
            }

            const data = await response.json();
            setSubscriptions(data);
        } catch (error) {
            console.error("Errore nel caricamento delle sottoscrizioni:", error);
            setFetchError(error.message || 'Impossibile caricare le sottoscrizioni.');
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setIsAuthenticated(true);
                    fetchSubscriptions(); // Carica le sottoscrizioni se autenticato
                } else {
                    localStorage.removeItem('jwt_token');
                    router.push('/auth/login');
                }
            } catch (error) {
                console.error("Errore nella decodifica del token:", error);
                localStorage.removeItem('jwt_token');
                router.push('/auth/login');
            }
        } else {
            router.push('/auth/login');
        }
        setLoading(false);
    }, [router, fetchSubscriptions]);

    // Gestione dell'aggiornamento di una sottoscrizione
    const handleSubscriptionUpdate = useCallback((id, updatedSub) => {
        setSubscriptions(prevSubs => prevSubs.map(sub => (sub.id === id ? updatedSub : sub)));
    }, []);

    // Gestione dell'eliminazione di una sottoscrizione
    const handleSubscriptionDelete = useCallback((id) => {
        setSubscriptions(prevSubs => prevSubs.filter(sub => sub.id !== id));
    }, []);

    /*
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        );
    }*/

    if (!isAuthenticated) {
        //return null; // Reindirizzamento gestito dall'useEffect
    }

    return (
        <>
            <Header/>
            <div className="container my-4">
                <h1 className="text-center mb-4">Le mie sottoscrizioni</h1>
                <p className="text-center lead">Qui potrai gestire le tue sottoscrizioni per ricevere avvisi sui prezzi
                    dei carburanti.</p>

                {/* Pulsante per creare una nuova notifica */}
                <div className="text-center mb-4">
                    <Link href="/notifiche/manage" className="btn btn-primary btn-lg">
                        <FaPlus className="me-2"/> Crea Nuova Notifica
                    </Link>
                </div>

                {/* Elenco delle notifiche */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Le tue sottoscrizioni attive</h5>
                        {fetchError && <div className="alert alert-danger">{fetchError}</div>}
                        {subscriptions.length === 0 && !fetchError ? (
                            <p>Nessuna notifica attiva. Clicca su "Crea Nuova Notifica" per aggiungerne una.</p>
                        ) : (
                            <ul className="list-group">
                                {subscriptions.map(sub => (
                                    <SubscriptionItem
                                        key={sub.id}
                                        subscription={sub}
                                        onUpdate={handleSubscriptionUpdate}
                                        onDelete={handleSubscriptionDelete}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}