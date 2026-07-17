'use client';

import { useState, useCallback } from 'react';
import SubscriptionItem from '@/components/notifiche/SubscriptionItem';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

export default function NotificheClient({ initialSubscriptions }) {
    const [subscriptions, setSubscriptions] = useState(initialSubscriptions);

    const handleSubscriptionUpdate = useCallback((id, updatedSub) => {
        setSubscriptions(prevSubs => prevSubs.map(sub => (sub.id === id ? updatedSub : sub)));
    }, []);

    const handleSubscriptionDelete = useCallback((id) => {
        setSubscriptions(prevSubs => prevSubs.filter(sub => sub.id !== id));
    }, []);

    return (
        <div className="container my-4">
            <h1 className="text-center mb-4">Le mie sottoscrizioni</h1>
            <p className="text-center lead">
                Qui potrai gestire le tue sottoscrizioni per ricevere avvisi sui prezzi dei carburanti.
            </p>

            {/* Pulsante per creare una nuova notifica */}
            <div className="text-center mb-4">
                <Link href="/notifiche/manage" className="btn btn-primary btn-lg">
                    <FaPlus className="me-2" /> Crea Nuova Notifica
                </Link>
            </div>

            {/* Elenco delle notifiche */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Le tue sottoscrizioni attive</h5>
                    {subscriptions.length === 0 ? (
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
    );
}