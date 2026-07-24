import {NextResponse} from 'next/server';
import {connectToDatabase} from "@/repos/mysql";


export async function GET(request) {

    const {searchParams} = new URL(request.url);

    const provincia = searchParams.get('provincia');

    if (!provincia) {
        console.error('Errore API /api/geo/comuni:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 422});
    }

    let connection;

    try {
        connection = await connectToDatabase();

        const [rows] = await connection.execute('SELECT id, description as name FROM comuni where comuni.provincia_id = ? ORDER BY name ', [provincia]);

        return NextResponse.json(rows);

    } catch (error) {
        console.error('Errore API /api/geo/comuni:', error);
        return NextResponse.json({error: 'Errore interno del server.'}, {status: 500});
    } finally {
        if (connection) {
            //await connection.end();
        }
    }
}
