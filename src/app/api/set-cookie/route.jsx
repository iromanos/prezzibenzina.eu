// app/api/set-cookie/route.ts
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {log} from "@/functions/helpers";

export async function POST(request) {

    const formData = await request.json();

    log("FORMDATA: " + JSON.stringify(formData));

    const cookieStore = await cookies();
    let ckCarburante = cookieStore.get('carburante')?.value;

    log(ckCarburante);

    const response = NextResponse.json({ok: true});

    if (formData.carburante !== undefined) {
        ckCarburante = formData.carburante;
    }

    if (ckCarburante === undefined) {
        ckCarburante = "benzina";
    }

    response.cookies.set('carburante', ckCarburante, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
    });


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
