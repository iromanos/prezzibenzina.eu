'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';
import {FaBell} from 'react-icons/fa';

export default function ImpiantoNotifyButton({impiantoId, defaultFuelType}) {
    const router = useRouter();
    const {isAuthenticated} = useAuth();

    const handleNotifyClick = () => {
        if (!isAuthenticated) {
            router.push('/auth/login'); // Reindirizza al login se non autenticato
            return;
        }
        // Pre-compila con i dati dell'impianto
        const queryParams = new URLSearchParams({
            fuel_type: defaultFuelType || 'Benzina', // Usa il defaultFuelType passato o 'Benzina'
            geo_level: 'distributore',
            geo_code: impiantoId,
        }).toString();
        router.push(`/notifiche/manage?${queryParams}`);
    };

    return (
        <div className="text-center my-4">
            <button
                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center mx-auto"
                onClick={handleNotifyClick}
            >
                <FaBell className="me-2"/> Ricevi le notifiche per questo impianto
            </button>
        </div>
    );
}