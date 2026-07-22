import {NextResponse} from 'next/server';
import {createPool} from '@/repos/mysql'; // Assicurati che il percorso sia corretto

export async function POST(request) {
    let connection;
    try {
        const {id_impianto, user_id, rating, comment} = await request.json();

        // Basic validation
        if (!id_impianto || !user_id || !rating) {
            return NextResponse.json({message: 'Missing required fields: id_impianto, user_id, rating'}, {status: 400});
        }
        if (rating < 1 || rating > 5) {
            return NextResponse.json({message: 'Rating must be between 1 and 5'}, {status: 400});
        }

        connection = await createPool();

        // Start a transaction
        await connection.beginTransaction();

        // 1. Insert the new review
        const [result] = await connection.execute(
            'INSERT INTO reviews (id_impianto, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [id_impianto, user_id, rating, comment]
        );

        const newReviewId = result.insertId;

        // 2. Update average_rating and total_reviews in the impianti table
        // This is a simplified approach. In a real-world scenario, you might want to
        // recalculate the average from all reviews or use triggers.
        await connection.execute(
            `UPDATE impianti
             SET total_reviews  = (SELECT COUNT(*) FROM reviews WHERE id_impianto = ?),
                 average_rating = (SELECT AVG(rating) FROM reviews WHERE id_impianto = ?)
             WHERE id_impianto = ?`,
            [id_impianto, id_impianto, id_impianto]
        );

        await connection.commit();

        return NextResponse.json({message: 'Review created successfully', reviewId: newReviewId}, {status: 201});

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating review:', error);
        return NextResponse.json({message: 'Error creating review', error: error.message}, {status: 500});
    } finally {
    }
}
