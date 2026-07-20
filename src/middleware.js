import {NextResponse} from 'next/server';
import { authMiddleware } from './middleware/authMiddleware';
import { getSeoHeaders, seoMiddleware } from './middleware/seoMiddleware';

export function middleware(request) {

    const authRedirect = authMiddleware(request);

    if (authRedirect) {
        return authRedirect;
    }

    const seoRedirect = seoMiddleware(request);

    if (seoRedirect) {
        return seoRedirect;
    }

    const requestHeaders = getSeoHeaders(request);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    return response;

}

// Opzionale: Configura il matcher per dire al middleware di ignorare i file statici a monte
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};