import {NextResponse} from 'next/server';

export async function GET() {
    // Con i JWT, il "logout" avviene principalmente lato client eliminando il token.
    // Questo endpoint serve principalmente come conferma o per future implementazioni di blacklist.
    return NextResponse.json({message: 'Logout effettuato con successo (il token JWT deve essere rimosso lato client).'}, {status: 200});
}