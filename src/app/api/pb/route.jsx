import {NextResponse} from 'next/server';
import {log} from "@/functions/helpers";

export async function POST(request) {

    const formData = await request.json();

    log(formData);

    const {type, name, lat, lon, carburante} = formData;

    if (!carburante) {
        return new NextResponse('Bad Request', { status: 400 });
    }

    // Costruisci la destinazione
    let target = `/${regione}/${carburante}`;

    if (provincia) {
        target += '/provincia/' + provincia.toLowerCase();
        if (comune) {
            target += '/' + comune.toLowerCase();
            if (marchio) {
                target += '/marchio/' + marchio.toLowerCase();
            }
            return NextResponse.redirect(new URL(target, request.url), 301);
        }
        if (marchio) {
            target += '/marchio/' + marchio.toLowerCase();
        }
        return NextResponse.redirect(new URL(target, request.url), 301);
    }


    if (marchio) {
        target += '/marchio/' + marchio.toLowerCase();
    }
    return NextResponse.redirect(new URL(target, request.url), 301);
}
