import React from 'react';
import Link from 'next/link';
import {getRouteLink} from "@/functions/helpers";

export function LinkCarburanti({params, carburanti}){
    return                 <section className="mb-4">
        <h2 className="h5 mb-3">Filtra per tipo di carburante</h2>
        <div className="d-flex flex-wrap gap-1" role="group">
            {carburanti.map((tipo) => {

                    const link = getRouteLink(params.regione, tipo, params.marchio, params.provincia, params.comune);

                return <Link
                    title={link.title}
                    className={`btn btn-sm ${params.carburante.toLowerCase() === tipo ? 'btn-primary' : 'btn-outline-primary'}`}

                    key={tipo} href={link.link}>{tipo}</Link>
            }
            )}
        </div></section>

}


export default function FiltroCarburante({regione, carburanti, selezionato}){
    return                 <section className="mb-4">
        <h2 className="h5 mb-3">Filtra per tipo di carburante</h2>
        <div className="btn-group" role="group">
            {carburanti.map((tipo) => (

                <React.Fragment key={tipo}>
                    <input
                        name={'carburante'}
                        type={'radio'}
                        value={tipo}
                        id={'id_' + tipo}
                        autoComplete={'off'}
                        className={`btn-check`}
                        defaultChecked={tipo === selezionato}
                    />
                    <label className={"btn btn-sm btn-outline-primary"}
                           htmlFor={'id_' + tipo}>{tipo}</label>

                </React.Fragment>

            ))}
        </div>
    </section>;

}