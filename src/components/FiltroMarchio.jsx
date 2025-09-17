import Link from "next/link";
import React from 'react';
import {getRouteLink} from "@/functions/api";


export function LinkMarchio({marchi, params}){

    marchi.unshift( { marchio:  'Tutti', key: ''});

    console.log(params);

    if(params.marchio === undefined) params.marchio = '';

    return <section className="mb-4">
            <h2 className="h5 mb-3">Filtra per marchio</h2>
        <div className="d-flex flex-wrap gap-1" role="group">
                {marchi.map((marchio) => {

                    const link = getRouteLink(params.regione, params.carburante, marchio.key, params.sigla, params.comune);

                    return <Link

                        className={`btn btn-sm ${params.marchio === marchio.key ? 'btn-primary' : 'btn-outline-primary'}`}

                        key={marchio.marchio} href={link}>{marchio.marchio}</Link>



                })}
            </div></section>;

}


export default function FiltroMarchio({marchi, selezionato}) {

    if (selezionato === null || selezionato === undefined) selezionato = '';

    marchi.unshift( { marchio:  'Tutti', key: ''});
    console.log(marchi);
    console.log(selezionato);
    return (
        <section className="mb-4">
            <h2 className="h5 mb-3">Filtra per marchio</h2>
            <div className="btn-group flex-wrap" role="group">
                {marchi.map((marchio) => <React.Fragment key={marchio.key}
                    ><input
                        name={'marchio'}
                        type={'radio'}
                        value={marchio.key}
                        id={'id_' + marchio.key}
                        autoComplete={'off'}
                        className={`btn-check`}
                        defaultChecked={marchio.key.toLowerCase() === selezionato}
                    />
                    <label className={"btn btn-sm btn-outline-primary"}
                           htmlFor={'id_' + marchio.key}>{marchio.marchio}</label></React.Fragment>
                )}
            </div>
        </section>
    );
}
