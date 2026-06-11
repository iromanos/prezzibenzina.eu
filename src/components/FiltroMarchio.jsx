import Link from "next/link";
import React from 'react';
import {getRouteLink, logDebug} from "@/functions/helpers";
import Image from "next/image";


export function LinkMarchio({marchi, params}){

    marchi.unshift( { marchio:  'Tutti', key: ''});

    logDebug(params);

    if(params.marchio === undefined) params.marchio = '';

    return <section className="mb-4 bg-warning-subtle p-2 border-warning border rounded">
        <h2 className="h6 mb-3 text-uppercase">Marchio</h2>
        <div className="d-flex flex-wrap gap-1" role="group">
                {marchi.map((marchio) => {

                    const link = getRouteLink(params.regione, params.carburante, marchio.marchio, params.provincia, params.comune);

                    return <Link

                        title={link.title}
                        className={`btn btn-sm ${params.marchio === marchio.key ? 'btn-warning' : 'btn-outline-warning'}`}

                        key={marchio.marchio} href={link.link}>

                        {marchio.key !== '' && <Image
                            className={'me-2'}
                            width={24} height={24}
                            src={process.env.NEXT_PUBLIC_IMAGE_ENDPOINT + `/impianto/logo/${marchio.key}/128`}
                            alt={marchio.marchio}/>}{marchio.marchio}</Link>



                })}
            </div></section>;

}


export default function FiltroMarchio({marchi, selezionato}) {

    if (selezionato === null || selezionato === undefined) selezionato = '';

    marchi.unshift( { marchio:  'Tutti', key: ''});
    logDebug(marchi);
    logDebug(selezionato);
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
