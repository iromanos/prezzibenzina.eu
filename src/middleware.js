import {NextResponse} from 'next/server';

export async function middleware(request) {
    const {pathname, search} = request.nextUrl;
    const startTime = Date.now()

    const requestHeaders = new Headers(request.headers)

    // Iniettiamo il pathname corrente in un header personalizzato chiamato x-url
    requestHeaders.set('x-url', request.nextUrl.pathname + request.nextUrl.search)

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

    const response = await NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    const duration = Date.now() - startTime

    // Filtra per loggare solo le richieste di pagine HTML (escludi asset statici se vuoi pulizia)
    // if (!request.nextUrl.pathname.includes('/_next/')) {
    //console.log(`[LOG] ${request.method} ${request.nextUrl.pathname} - ${duration}ms`);
    // }
    return response;

}

// Opzionale: Configura il matcher per dire al middleware di ignorare i file statici a monte
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};