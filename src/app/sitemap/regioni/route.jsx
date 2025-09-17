import {getSiteMap} from "@/functions/api";

const URI = process.env.NEXT_PUBLIC_API_ENDPOINT + '/pb/';


export async function GET() {
    return getSiteMap({tipo: "regioni"});
}