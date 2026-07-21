import {NextResponse} from 'next/server';
import {connectToDatabase} from '@/repos/mysql'; // Assicurati che il percorso sia corretto

export async function GET(request, {params}) {
    let connection;
    try {
        const id_impianto = params.id;

        if (!id_impianto) {
            return NextResponse.json({message: 'Missing id_impianto parameter'}, {status: 400});
        }

        connection = await connectToDatabase();

        // Fetch average_rating and total_reviews from the impianti table
        const [result] = await connection.query(
            `SELECT average_rating, total_reviews
             FROM impianti
             WHERE id_impianto = ?`,
            [id_impianto]
        );

        if (result.length === 0) {
            return NextResponse.json({message: 'Impianto not found'}, {status: 404});
        }

        return NextResponse.json(result[0], {status: 200});

    } catch (error) {
        console.error(`Error fetching average rating for impianto ${params.id}:`, error);
        return NextResponse.json({message: 'Error fetching average rating', error: error.message}, {status: 500});
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
