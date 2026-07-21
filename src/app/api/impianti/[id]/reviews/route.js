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

        // Fetch reviews for the given id_impianto, only approved ones
        const [reviews] = await connection.query(
            `SELECT r.id, r.id_impianto, r.user_id, u.name as user_name, r.rating, r.comment, r.created_at, r.updated_at
             FROM reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.id_impianto = ? AND r.status = 'approved'
             ORDER BY r.created_at DESC`,
            [id_impianto]
        );

        return NextResponse.json(reviews, {status: 200});

    } catch (error) {
        console.error(`Error fetching reviews for impianto ${params.id}:`, error);
        return NextResponse.json({message: 'Error fetching reviews', error: error.message}, {status: 500});
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
