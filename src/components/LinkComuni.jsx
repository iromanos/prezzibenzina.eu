import React from "react";
import Link from 'next/link';
import {getRouteLink, ucwords} from "@/functions/helpers";


export function LinkProvincie({provincie, riepilogo}) {


    const {request} = riepilogo;


    return <section className="mb-4">
        <label className="form-label text-uppercase mb-1 small ">Provincie in {request.regione}</label>
        <div className="d-flex flex-wrap gap-2">

            {provincie?.map((p) => {
                const link = getRouteLink(request.regione, request.carburante.toLowerCase(), request.marchio?.id, p.id.toLowerCase());

                return <Link
                    title={p.description}
                    key={p.id} className={'small'}
                    href={link.link}>
                    {p.description}
                </Link>;

            })}
        </div>
    </section>

}

export default function LinkComuni({comuni, riepilogo}) {


    const {request} = riepilogo;

    const marchio = riepilogo.marchio ? riepilogo.marchio.nome : null;

    return <>
        <section className="mb-4">
            <label className="form-label text-uppercase mb-1 small ">Città principali in provincia
                di {request.provincia_descrizione}</label>
            <div className="d-flex flex-wrap gap-2">
                {comuni?.map((comune) => {
                    const link = getRouteLink(request.regione, request.carburante.toLowerCase(), marchio, request.provincia, comune);

                    return <Link
                        title={link.title}
                        key={comune.id} className={'small'}
                                 href={link.link}>
                        {ucwords(comune.description)} ({comune.impianti})
                    </Link>;

                })}
            </div>
        </section></>;



}