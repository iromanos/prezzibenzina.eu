import {NextResponse} from 'next/server';
import {getPrezziMediProvincialiPerRegione} from '@/repos/prezzi-medi.jsx';

export async function GET(request, {params}) {
    try {
        const {regione} = params; // Estrae lo slug della regione dall'URL

        if (!regione) {
            return NextResponse.json({error: 'Parametro regione mancante'}, {status: 400});
        }

        const formattedResults = await getPrezziMediProvincialiPerRegione(regione);

        if (formattedResults.length === 0) {
            return NextResponse.json({message: `Nessun dato provinciale trovato per la regione: ${regione}`}, {status: 404});
        }

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error(`Errore nel recupero dei prezzi medi provinciali per la regione: ${params.regione}`, error);
        return NextResponse.json({error: 'Errore interno del server'}, {status: 500});
    }
}
