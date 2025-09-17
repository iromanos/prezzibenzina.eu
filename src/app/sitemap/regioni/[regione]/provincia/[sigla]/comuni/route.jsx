import {getSiteMap} from "@/functions/api";

const URI = process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/';


export async function GET(request) {

    const pathname = request.nextUrl.pathname; // es: /sitemap/regioni/toscana/provincie
    const match = pathname.match(/\/sitemap\/regioni\/([^/]+)\/provincia\/([^/]+)\/comuni/);
    const regione = match?.[1];
    const provincia = match?.[2];


    return getSiteMap({tipo: "comuni", regione: regione, provincia: provincia});
}