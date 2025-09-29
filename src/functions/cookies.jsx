import {cookies} from "next/headers";

export async function getCookie() {
    const cookieStore = await cookies();
    let ckCarburante = cookieStore.get('carburante')?.value;
    let ckLimite = cookieStore.get('limit')?.value;

    if (ckCarburante === undefined) ckCarburante = 'benzina';
    if (ckLimite === undefined) ckLimite = 25;

    return {
        'carburante': ckCarburante, 'limite': ckLimite
    };
}