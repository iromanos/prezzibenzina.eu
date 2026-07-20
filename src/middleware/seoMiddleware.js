import { NextResponse } from 'next/server';

export function seoMiddleware(request) {
    const { pathname } = request.nextUrl;

    // 1. Verifica lowercase redirect
    if (
        /[A-Z]/.test(pathname) &&
        !pathname.startsWith('/_next') &&
        !pathname.includes('.')
    ) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.toLowerCase();
        return NextResponse.redirect(url, 301);
    }

    // 2. Preparazione Header x-url
    // Non restituiamo una NextResponse qui perché vogliamo che la catena continui
    // Restituiamo null o un oggetto per segnalare che non c'è un redirect
    return null; 
}

export function getSeoHeaders(request) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-url', request.nextUrl.pathname + request.nextUrl.search);
    return requestHeaders;
}