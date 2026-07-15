'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';
import {FaBell} from 'react-icons/fa';

export default function DistributoriNotifyButton({serviceSlug, comuneSlug, currentFuel}) {
    const router = useRouter();
    const {isAuthenticated} = useAuth();

    const handleNotifyClick = () => {
        if (!isAuthenticated) {
            router.push('/auth/login'); // Reindirizza al login se non autenticato
            return;
        }

        // Pre-compila con i dati della pagina dei risultati
        const queryParams = new URLSearchParams({
            fuel_type: currentFuel || 'Benzina',
            geo_level: comuneSlug === 'vicino-a-me' ? 'nazionale' : 'comune', // Se "vicino-a-me", usa nazionale come default per la notifica
            geo_code: comuneSlug === 'vicino-a-me' ? 'IT' : comuneSlug, // Se "vicino-a-me", usa IT come default per la notifica
            // Potremmo voler aggiungere il servizio come filtro, ma la sottoscrizione è per carburante e area
        }).toString();
        router.push(`/notifiche?${queryParams}`);
    };

    return (
        <div className="text-center my-4">
            <button
                className="btn btn-outline-primary d-flex align-items-center justify-content-center mx-auto"
                onClick={handleNotifyClick}
            >
                <FaBell className="me-2"/> Ricevi Notifiche Prezzo per questa zona
            </button>
        </div>
    );
}