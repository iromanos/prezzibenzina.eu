// app/api/set-cookie/route.ts
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {log} from "@/functions/helpers";

export async function POST() {


    const cookieStore = await cookies();

    let ckCarburante = cookieStore.get('carburante')?.value;

    log(ckCarburante);

    const response = NextResponse.json({ok: true});

    if (ckCarburante === undefined) {
        response.cookies.set('carburante', 'benzina', {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false,
        });
    }

    let ckLimit = cookieStore.get('limit')?.value;
    if (ckLimit === undefined) {
        response.cookies.set('limit', '25', {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false,
        });
    }


    return response;
}
