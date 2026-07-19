import {NextResponse} from 'next/server';
import {jwtDecode} from "jwt-decode";

const protectedPaths = [
    '/notifiche',
    '/preferiti',
    '/profilo'
];

export function authMiddleware(request) {
    const { pathname, search } = request.nextUrl;
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected) {
        const token = request.cookies.get('jwt_token')?.value;

        if (!token) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname + search);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 <= Date.now()) {
                const response = NextResponse.redirect(new URL('/auth/login', request.url));
                response.cookies.delete('jwt_token');
                return response;
            }
        } catch (e) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return null; // Continua la catena
}