import {NextResponse} from 'next/server';
import {createPool} from '@/repos/mysql'; // Switch to a pool for high performance

// Caching: Revalidate this data every 5 minutes to handle high traffic (100k users)
export const revalidate = 300; 

export async function GET(request, {params}) {
    try {
        const {id: id_impianto} = params;
        if (!id_impianto) {
            return NextResponse.json({message: 'Missing id_impianto parameter'}, {status: 400});
        }
        const pool = await createPool();

        // Use the pool to execute the query. 
        // The pool handles opening/releasing connections automatically.
        const [rows] = await pool.execute(
            `SELECT average_rating, total_reviews
             FROM impianti
             WHERE id_impianto = ?`,
            [id_impianto]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({message: 'Impianto not found'}, {status: 404});
        }

        // Return data with Cache-Control headers via Next.js response
        return NextResponse.json(rows[0], {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });

    } catch (error) {
        console.error(`Error fetching average rating for impianto ${params.id}:`, error);
        // Avoid leaking error.message to the client for security/cleanliness
        return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
    }
}
