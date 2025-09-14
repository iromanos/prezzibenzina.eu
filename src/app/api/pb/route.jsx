import { NextResponse } from 'next/server';

export async function POST(request) {

    const formData = await request.formData();

    // const { regione, carburante, provincia, comune, marchio } = await request.json();
    const regione = formData.get('regione');
    const carburante = formData.get('carburante');
    const marchio = formData.get('marchio');


    if (!regione || !carburante) {
        return new NextResponse('Bad Request', { status: 400 });
    }



    // Costruisci la destinazione
    let target = `/${regione}/${carburante}`;

    if (marchio) {
        target += '/marchio/' + marchio.toLowerCase();
    }
    return NextResponse.redirect(new URL(target, request.url), 301);
}
