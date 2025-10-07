import {cookies} from "next/headers";
import {log} from "@/functions/helpers";

export async function getCookie() {
    const cookieStore = await cookies();
    let ckCarburante = cookieStore.get('carburante')?.value;
    let ckLimite = cookieStore.get('limit')?.value;

    if (ckCarburante === undefined) ckCarburante = 'benzina';
    if (ckLimite === undefined) ckLimite = 25;

    log("CARBURANTE: " + ckCarburante);

    return {
        'carburante': ckCarburante, 'limite': ckLimite
    };
}