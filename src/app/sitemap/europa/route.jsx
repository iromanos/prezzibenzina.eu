import {getSiteMap} from "@/functions/api";

export async function GET(request) {

    return getSiteMap({tipo: "europa"});

}