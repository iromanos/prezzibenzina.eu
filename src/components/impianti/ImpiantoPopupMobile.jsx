import React from 'react';
import Bandiera from "@/components/Bandiera";
import ImpiantoCardClient from "@/components/impianti/ImpiantoCardClient";

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
        link
    } = impianto;
    const schedaUrl = `/impianto/${link}`;


    return (
        <div className={''} key={id_impianto}>
            <div className="d-flex align-items-start gap-3 mb-2">
                <div className={'text-center'}>
                    <img className={'d-block'} src={URI_IMAGE + image} alt={bandiera} width={48} height={48}/>
                    <Bandiera sigla={impianto.stato}/>
                </div>
                <div className={'col'}>
                    <a href={schedaUrl} className={'text-decoration-none text-dark'}>

                    <h6 className="mb-0 text-uppercase">{nome_impianto}</h6>
                        <small className="text-muted d-block">{gestore}</small></a>
                    {prezzo ? <>
                        <span className={'bg-success text-white rounded fs-3 px-2'}>{prezzo.toFixed(3)} <span style={{
                            fontSize: '0.8rem',
                        }}>€/L</span></span></> : null}
                    </div>
                </div>
            <span className={'text-muted small'}>
                    {indirizzo}{comune ? `, ${comune}` : null} {provincia ? `(${provincia})` : null}</span>
                <div className="d-flex flex-wrap gap-2 mt-2 small">
                    <ImpiantoCardClient apriMappa={false} impianto={impianto} vicini={false} isMobile={true}/>
                </div>
        </div>
    );
}
