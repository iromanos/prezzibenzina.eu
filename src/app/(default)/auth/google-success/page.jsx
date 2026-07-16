'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

export default function GoogleSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // 1. Salva il token nel localStorage per mantenere la sessione
            localStorage.setItem('jwt_token', token);

            // 2. Reindirizza alla pagina protetta desiderata.
            // `router.replace` è usato per sostituire la pagina nella cronologia,
            // impedendo all'utente di tornare a questa pagina intermedia con il tasto "indietro".
            router.replace('/notifiche');
        } else {
            // Se la pagina viene raggiunta senza un token, qualcosa è andato storto.
            setError('Autenticazione fallita: token non trovato. Sarai reindirizzato al login.');
            setTimeout(() => {
                router.replace('/auth/login');
            }, 3000); // Reindirizza dopo 3 secondi
        }
    }, [router, searchParams]);

    // Se c'è un errore, mostralo all'utente
    if (error) {
        return (
            <>
                <Header />
                <div className="container my-5 text-center">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </>
        );
    }

    // Durante il processo (che è molto rapido), mostra un indicatore di caricamento
    return (
        <>
            <Header />
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <h4 className="mt-3">Finalizzando l'accesso...</h4>
            </div>
        </>
    );
}
