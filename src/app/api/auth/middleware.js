import {NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';

export function authMiddleware(handler) {
    return async (request, ...args) => {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({error: 'Accesso non autorizzato. Token mancante.'}, {status: 401});
        }

        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
            request.user = decoded; // Aggiunge i dati dell'utente decodificati alla richiesta
            return handler(request, ...args);
        } catch (error) {
            console.error("Errore verifica token:", error);
            return NextResponse.json({error: 'Accesso non autorizzato. Token non valido o scaduto.'}, {status: 401});
        }
    };
}