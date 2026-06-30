import React from "react";
import Link from 'next/link';
import {getRouteLink, logDebug} from "@/functions/helpers";

export default function LinkComuni({comuni, riepilogo}) {


    const {request} = riepilogo;

    const marchio = riepilogo.marchio ? riepilogo.marchio.nome : null;

    logDebug("COMUNI: " + JSON.stringify(comuni));

    return <>
        <section className="mb-4">
            <h2 className="h6 text-uppercase">Città principali</h2>
            <div className="d-flex flex-wrap gap-2">
                {comuni.map((comune) => {
                    const link = getRouteLink(request.regione, request.carburante.toLowerCase(), marchio, request.provincia, comune);

                    return <Link
                        title={link.title}
                        key={comune.id} className={'small'}
                                 href={link.link}>
                        {comune.description}
                    </Link>;

                })}
            </div>
        </section></>;



}