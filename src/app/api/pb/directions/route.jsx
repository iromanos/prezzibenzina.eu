import {NextResponse} from 'next/server';

export async function POST(request) {
    try {
        // 1. Recupera le coordinate inviate dal frontend
        const body = await request.json();
        const coordinates = body;

        if (!coordinates || !coordinates.start || !coordinates.end) {
            return NextResponse.json(
                {error: 'Coordinate di partenza e arrivo mancanti o non valide.'},
                {status: 400}
            );
        }

        const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

        const apiKey = process.env.OPENROUTESERVICE_KEY;

        const payload = [
            [coordinates.start.lng, coordinates.start.lat],
            [coordinates.end.lng, coordinates.end.lat],
        ];

        // 2. Fai la chiamata a OpenRouteService dal server
        const orsResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Content-Type': 'application/json',
                'Authorization': apiKey,
            },
            body: JSON.stringify({coordinates: payload}),
        });

        if (!orsResponse.ok) {
            const errorText = await orsResponse.text();
            return NextResponse.json(
                {error: `Errore da OpenRouteService: ${errorText}`},
                {status: orsResponse.status}
            );
        }

        const data = await orsResponse.json();

        // 3. Restituisci i dati al tuo frontend
        return NextResponse.json(data);

    } catch (error) {
        console.error('Errore nel server proxy:', error);
        return NextResponse.json(
            {error: 'Errore interno del server'},
            {status: 500}
        );
    }
}