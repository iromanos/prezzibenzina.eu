//TODO: sitemap dei capoluoghi di provincia

import {NextResponse} from "next/server";
import {URI} from "@/functions/api";

export async function GET() {


    let request = URI + 'sitemap/capoluoghi';

    const res = await fetch(request);

    const xml = await res.text();

    return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'no-cache',
                'Last-Modified': new Date().toUTCString(),
            }
        }
    );


}