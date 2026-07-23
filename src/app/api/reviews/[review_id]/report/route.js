import {NextResponse} from 'next/server';
import {createPool} from '@/repos/mysql.js'; // Assicurati che il percorso sia corretto

export async function POST(request, {params}) {
    let connection;
    try {

        const reviewId = params.review_id;
        const {user_id} = await request.json(); // user_id of the user reporting the review

        if (!reviewId) {
            return NextResponse.json({message: 'Missing review_id parameter'}, {status: 400});
        }

        // In a real application, you might want to store who reported it
        // and prevent multiple reports from the same user.
        // For now, we just need to know *a* user is reporting.

        if (!user_id) {
            return NextResponse.json({message: 'Missing required field: user_id of the reporter'}, {status: 400});
        }

        connection = await createPool();
        await connection.beginTransaction();

        // 1. Check if the review exists
        const [existingReview] = await connection.execute(
            'SELECT id FROM reviews WHERE id = ?',
            [reviewId]
        );

        if (existingReview.length === 0) {
            await connection.rollback();
            return NextResponse.json({message: 'Review not found'}, {status: 404});
        }

        // 2. Update the review status to 'reported'
        // Note: In a more complex system, you might have a separate 'reports' table
        // and a workflow for moderation. Here, we directly change the status.
        await connection.execute(
            'UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?',
            ['reported', reviewId]
        );

        // No need to recalculate average_rating/total_reviews for reporting,
        // as reported reviews are typically excluded from public counts/averages
        // by filtering for status = 'approved' in GET requests.

        await connection.commit();

        return NextResponse.json({message: `Review ${reviewId} reported successfully`}, {status: 200});

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(`Error reporting review ${params.review_id}:`, error);
        return NextResponse.json({message: 'Error reporting review', error: error.message}, {status: 500});
    } finally {
    }
}
