'use client';

import {useCallback, useState} from 'react';
import SubscriptionItem from '@/components/notifiche/SubscriptionItem';
import Link from 'next/link';
import {FaPlus} from 'react-icons/fa';

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
            <div className="text-center mb-4">
                <h1 className="">Le mie Notifiche</h1>
                <p className="lead">
                    Gestisci le tue sottoscrizioni per ricevere avvisi sui prezzi dei carburanti.
                </p>
            </div>

            <div className="text-center mb-4">
                <Link href="/notifiche/manage" className="btn btn-primary btn-lg shadow-sm">
                    <FaPlus className="me-2" /> Crea Nuova Notifica
                </Link>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <ul className="list-group shadow-sm">
                        {subscriptions.length === 0 ? (
                            <li className="list-group-item text-center p-4">
                                <p className="mb-0">Nessuna notifica attiva.</p>
                                <p className="text-muted">Clicca su "Crea Nuova Notifica" per aggiungerne una e non
                                    perdere le migliori offerte.</p>
                            </li>
                        ) : (
                            subscriptions.map(sub => (
                                <SubscriptionItem
                                    key={sub.id}
                                    subscription={sub}
                                    onUpdate={handleSubscriptionUpdate}
                                    onDelete={handleSubscriptionDelete}
                                />
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}