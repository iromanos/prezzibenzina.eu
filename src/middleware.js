import {NextResponse} from 'next/server';

export function middleware(request) {
    const {pathname, search} = request.nextUrl;
    // const startTime = performance.now();
    // Verifica se il percorso contiene lettere maiuscole
    // Escludiamo i file statici (immagini, _next, favicon) per evitare loop o problemi
    if (
        /[A-Z]/.test(pathname) &&
        !pathname.startsWith('/_next') &&
        !pathname.includes('.') // Evita di toccare file come .png, .jpg, .svg, ecc.
    ) {
        // Converte il path in tutto minuscolo
        const lowercasePathname = pathname.toLowerCase();

        // Crea il nuovo URL mantenendo anche gli eventuali parametri di ricerca (es. ?page=1)
        const url = request.nextUrl.clone();
        url.pathname = lowercasePathname;

        // Ritorna un redirect permanente (301)
        return NextResponse.redirect(url, 301);
    }

    const response = NextResponse.next();
    /*
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(3);

    response.headers.set('Server-Timing', `next-ssr;dur=${duration};desc="Next.js App Router"`);
    */
    return response;

}

// Opzionale: Configura il matcher per dire al middleware di ignorare i file statici a monte
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};