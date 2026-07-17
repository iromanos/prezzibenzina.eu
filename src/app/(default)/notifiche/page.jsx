import { cookies } from 'next/headers';
import Header from '@/components/Header';
import NotificheClient from '@/components/NotificheClient'; // Importa il componente NotificheClient';

async function getSubscriptions(token) {
    // Nota: In un Server Component, fetch richiede un URL assoluto 
    // o una chiamata diretta al database/servizio interno.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    try {
        const response = await fetch(`${baseUrl}/api/subscriptions/list`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store' // Per avere dati sempre aggiornati
        });

        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Errore fetch server-side:", error);
        return [];
    }
}

export default async function NotifichePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;

    // Il token è garantito dal middleware, ma facciamo un check di sicurezza per il fetch
    const subscriptions = await getSubscriptions(token);

    return (
        <>
            <Header />
            <NotificheClient initialSubscriptions={subscriptions} />
        </>
    );
}
