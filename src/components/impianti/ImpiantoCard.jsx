import React from 'react';
import ImpiantoCardClient from "@/components/impianti/ImpiantoCardClient";
import Bandiera from "@/components/Bandiera";


export default function ImpiantoCard({impianto, cardClient = true}) {

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

        <div className="card mb-3 shadow-sm bg-white" key={id_impianto}>
            <div className="card-body">
                <a href={schedaUrl} className={'text-decoration-none text-dark'}>
                <div className="d-flex align-items-start gap-3 mb-2">
                    <img src={URI_IMAGE + image} alt={bandiera} width={48} height={48}/>
                    <div className={'col'}>
                        <h5 className="mb-0 text-uppercase">{nome_impianto}</h5>
                        <small className="text-muted">{gestore}</small>
                    </div>
                    <div className={'col-1'}>
                        <Bandiera sigla={impianto.stato}/></div>

                </div>
                </a>
                <p className="mb-1 text-muted">
                    {indirizzo}{comune != null ? ', ' + comune : null} {provincia != null ? `(${provincia})` : null}
                    {tipo_impianto != null ? ` - ${tipo_impianto}` : null}
                </p>
                {cardClient &&
                    <div className="d-flex flex-wrap gap-2 mt-2 small align-items-center">
                        <ImpiantoCardClient isMobile={true} impianto={impianto}/>
                        <div className={'bg-success rounded-2 text-white py-1 px-2 ms-auto'}>
                            <strong className={'fs-4'}>{prezzo.toFixed(3)} <span style={{
                                fontSize: '.8rem'
                            }}>€/L</span></strong></div>

                </div>}
            </div>
        </div>
    );
}
