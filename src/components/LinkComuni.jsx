import React from "react";
import Link from 'next/link';
import {getLink} from "@/functions/api";

export default function LinkComuni({params, comuni}) {


    const {regione, carburante, marchio, sigla} = params;


    return <>
        <section className="mb-4">
            <h2 className="h5 mb-3">Città principali</h2>
            <div className="d-flex flex-wrap gap-2">
                {comuni.map((comune) => {
                    // console.log(comune);
                    const link = getLink(regione, carburante, marchio, comune.provincia, comune.key);
                    // console.log(link);

                    return <Link key={comune.key} className={'btn btn-sm btn-outline-secondary'}



                                 href={link.link}>
                        {comune.nome}
                    </Link>;

                })}
            </div>
        </section></>;



}