// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        
        const cookieStore = await cookies()
        
        cookieStore.delete('jwt_token', { path: '/' }); // Rimuove il cookie impostando maxAge a 0
        
        return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
