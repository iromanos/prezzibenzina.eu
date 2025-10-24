import React from 'react';
import ImpiantoCardClientVer2 from "@/components/impianti/ImpiantoCardClientVer2";
import Bandiera from "@/components/Bandiera";

export default function ImpiantoPopupMobile({impianto}) {

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
        <div className={''} key={id_impianto}>
            <div className="d-flex align-items-start gap-3 mb-2">
                <div className={'text-center'}>
                    <img className={'d-block'} src={URI_IMAGE + image} alt={bandiera} width={48} height={48}/>
                    <Bandiera sigla={impianto.stato}/>
                </div>
                <div className={'col'}>
                        <h6 className="mb-0">{nome_impianto}</h6>
                        <small className="text-muted">{gestore}</small>
                    </div>

                </div>

                <p className="mb-1">
                    {prezzo ? <>
                        <strong>{prezzo.toFixed(3)} €/L</strong></> : null} {tipo_impianto ? <> - {tipo_impianto}</> : null}<br/>
                    {indirizzo}{comune ? `, ${comune}` : null} {provincia ? `(${provincia})` : null}
                </p>

                <div className="d-flex flex-wrap gap-2 mt-2 small">
                    <ImpiantoCardClientVer2 impianto={impianto} apriMappa={false}/>
                </div>
        </div>
    );
}
