import {NextResponse} from "next/server";
import {URI} from "@/functions/api";

export async function GET(r, {params}) {

    const {tipo} = await params;

    let request = URI + `sitemap/${tipo}`;

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