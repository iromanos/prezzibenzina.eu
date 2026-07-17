import {NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import {createUser} from '@/repos/users';
// Assumendo che tu abbia delle funzioni per interagire con il DB
// import { findUserByEmail, createUser } from '@/lib/db'; 

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        console.error('Errore durante l\'autenticazione Google:', error);
        // Reindirizza alla pagina di login con un messaggio di errore
        return NextResponse.redirect(new URL('/auth/login?error=GoogleAuthFailed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/auth/login?error=MissingCode', request.url));
    }

    try {
        // 1. Scambia il codice per un token di accesso
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET, // Variabile d'ambiente privata
                redirect_uri: `${new URL(request.url).origin}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            new Error(tokenData.error_description || 'Errore nello scambio del codice');
        }

        // 2. Usa l'access token per ottenere le informazioni dell'utente
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profileData = await profileResponse.json();
        
        console.log('Dati del profilo Google:', profileData);
        
        const { email, name, picture } = profileData;

        const user = await createUser({email, name, googleId: profileData.id, avatar: picture});

        // 4. Crea il tuo JWT per la sessione utente
        const appToken = jwt.sign(user, process.env.NEXTAUTH_SECRET, {expiresIn: '1h'});

        // 5. Reindirizza l'utente alla home page e imposta il cookie della sessione.
        const redirectUrl = new URL('/', request.url);
        const response = NextResponse.redirect(redirectUrl);

        // Imposta il cookie JWT sulla risposta.
        // httpOnly: true -> Il cookie non è accessibile da JavaScript lato client.
        response.cookies.set('jwt_token', appToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 }); // maxAge in secondi (1 ora)
        return response;

    } catch (err) {
        console.error('Errore nel callback di Google:', err);
        return NextResponse.redirect(new URL('/auth/login?error=CallbackFailed', request.url));
    }
}
