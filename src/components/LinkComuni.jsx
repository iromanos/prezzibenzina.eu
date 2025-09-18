import React from "react";
import Link from 'next/link';
import {getRouteLink} from "@/functions/helpers";

export default function LinkComuni({params, comuni, riepilogo}) {


    const {regione, carburante} = params;

    const marchio = riepilogo.marchio ? riepilogo.marchio.nome : null;

    return <>
        <section className="mb-4">
            <h2 className="h5 mb-3">Città principali</h2>
            <div className="d-flex flex-wrap gap-2">
                {comuni.map((comune) => {
                    // console.log(comune);
                    const link = getRouteLink(regione, carburante, marchio, comune.provincia.toLowerCase(), comune.key);
                    // console.log(link);

                    return <Link
                        title={link.title}
                        key={comune.key} className={'btn btn-sm btn-outline-secondary'}
                                 href={link.link}>
                        {comune.nome}
                    </Link>;

                })}
            </div>
        </section></>;



}