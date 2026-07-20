import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';

export async function POST() {
    const cookieStore = await cookies();

    try {
        cookieStore.delete('jwt_token');

        return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({error: 'Logout failed'}, {status: 500});
    }
}