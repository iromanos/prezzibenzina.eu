import {getSiteMap} from "@/functions/api";

const URI = process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/';


export async function GET(request) {

    const pathname = request.nextUrl.pathname; // es: /sitemap/regioni/toscana/provincie
    const match = pathname.match(/\/sitemap\/regioni\/([^/]+)\/provincia/);
    const regione = match?.[1];


    return getSiteMap({tipo: "provincie", regione: regione});
}