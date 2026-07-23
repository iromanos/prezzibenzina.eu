import {NextResponse} from 'next/server';
import {createPool} from '@/repos/mysql.js'; // Assicurati che il percorso sia corretto

export async function PUT(request, {params}) {
    let connection;
    try {
        const reviewId = params.review_id;
        const {user_id, rating, comment} = await request.json(); // user_id for authorization check

        if (!reviewId) {
            return NextResponse.json({message: 'Missing review_id parameter'}, {status: 400});
        }
        if (!user_id || rating === null) {
            return NextResponse.json({message: 'Missing required fields: user_id, rating'}, {status: 400});
        }
        if (rating < 1 || rating > 5) {
            return NextResponse.json({message: 'Rating must be between 1 and 5'}, {status: 400});
        }

        connection = await createPool();
        await connection.beginTransaction();

        // 1. Verify ownership of the review
        const [existingReview] = await connection.execute(
            'SELECT id_impianto, user_id FROM reviews WHERE id = ?',
            [reviewId]
        );

        if (existingReview.length === 0) {
            await connection.rollback();
            return NextResponse.json({message: 'Review not found'}, {status: 404});
        }

        if (existingReview[0].user_id !== user_id) {
            await connection.rollback();
            return NextResponse.json({message: 'Unauthorized: You can only update your own reviews'}, {status: 403});
        }

        const id_impianto = existingReview[0].id_impianto;

        // 2. Update the review
        await connection.execute(
            'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
            [rating, comment, reviewId]
        );

        // 3. Recalculate average_rating and total_reviews for the impianto
        await connection.execute(
            `UPDATE impianti
             SET total_reviews = (SELECT COUNT(*) FROM reviews WHERE id_impianto = ? AND status = 'approved'),
                 average_rating = (SELECT AVG(rating) FROM reviews WHERE id_impianto = ? AND status = 'approved')
             WHERE id_impianto = ?`,
            [id_impianto, id_impianto, id_impianto]
        );

        await connection.commit();

        return NextResponse.json({message: 'Review updated successfully'}, {status: 200});

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(`Error updating review ${params.review_id}:`, error);
        return NextResponse.json({message: 'Error updating review', error: error.message}, {status: 500});
    } finally {
    }
}

export async function DELETE(request, {params}) {
    let connection;
    try {
        const reviewId = params.review_id;
        const {user_id} = await request.json(); // user_id for authorization check

        if (!reviewId) {
            return NextResponse.json({message: 'Missing review_id parameter'}, {status: 400});
        }
        if (!user_id) {
            return NextResponse.json({message: 'Missing required field: user_id'}, {status: 400});
        }

        connection = await createPool();
        await connection.beginTransaction();

        // 1. Verify ownership of the review
        const [existingReview] = await connection.execute(
            'SELECT id_impianto, user_id FROM reviews WHERE id = ?',
            [reviewId]
        );

        if (existingReview.length === 0) {
            await connection.rollback();
            return NextResponse.json({message: 'Review not found'}, {status: 404});
        }

        if (existingReview[0].user_id !== user_id) {
            await connection.rollback();
            return NextResponse.json({message: 'Unauthorized: You can only delete your own reviews'}, {status: 403});
        }

        const id_impianto = existingReview[0].id_impianto;

        // 2. Delete the review
        await connection.execute(
            'DELETE FROM reviews WHERE id = ?',
            [reviewId]
        );

        // 3. Recalculate average_rating and total_reviews for the impianto
        await connection.execute(
            `UPDATE impianti
             SET total_reviews = (SELECT COUNT(*) FROM reviews WHERE id_impianto = ? AND status = 'approved'),
                 average_rating = (SELECT AVG(rating) FROM reviews WHERE id_impianto = ? AND status = 'approved')
             WHERE id_impianto = ?`,
            [id_impianto, id_impianto, id_impianto]
        );

        await connection.commit();

        return NextResponse.json({message: 'Review deleted successfully'}, {status: 200});

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(`Error deleting review ${params.review_id}:`, error);
        return NextResponse.json({message: 'Error deleting review', error: error.message}, {status: 500});
    } finally {
    }
}
