import React from 'react';
import ImpiantoCardClient from "@/components/impianti/ImpiantoCardClient";
import Bandiera from "@/components/Bandiera";

export default function ImpiantoCard({impianto, cardClient = true}) {

    //todo: scheda impianto svizzero

    const URI_IMAGE = process.env.NEXT_PUBLIC_API_ENDPOINT;


    const {
        id_impianto,
        gestore,
        bandiera,
        tipo_impianto,
        nome_impianto,
        indirizzo,
        comune,
        provincia,
        prezzo,
        image,
    } = impianto;


    return (
        <div className="card mb-3 shadow-sm" key={id_impianto}>
            <div className="card-body">
                <div className="d-flex align-items-start gap-3 mb-2">
                    <img src={URI_IMAGE + image} alt={bandiera} width={48} height={48}/>
                    <div className={'col'}>
                        <h5 className="mb-0">{nome_impianto}</h5>
                        <small className="text-muted">{gestore}</small>
                    </div>
                    <div className={'col-1'}>
                        <Bandiera sigla={impianto.stato}/></div>
                </div>

                <p className="mb-1">
                    <strong>{prezzo.toFixed(3)} €/L</strong>{tipo_impianto != null ? ` - ${tipo_impianto}` : null}<br/>
                    {indirizzo}{comune != null ? ', ' + comune : null} {provincia != null ? `(${provincia})` : null}
                </p>
                {cardClient &&
                <div className="d-flex flex-wrap gap-2 mt-2 small">
                    <ImpiantoCardClient impianto={impianto}/>
                </div>}
            </div>
        </div>
    );
}
