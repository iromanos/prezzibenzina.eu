import {NextResponse} from 'next/server';
import {getPrezziMediRegioneAggregati} from '@/repos/prezzi-medi.jsx'; // Aggiornato il percorso di importazione

export async function GET(request) {
    try {
        // Chiama la funzione dal repository per ottenere i dati aggregati
        const formattedResults = await getPrezziMediRegioneAggregati();

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error('Errore nel recupero dei prezzi medi regionali aggregati:', error);
        return NextResponse.json({error: 'Errore interno del server'}, {status: 500});
    }
}