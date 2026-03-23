import React from 'react';
import ImpiantoCardClient from "@/components/impianti/ImpiantoCardClient";
import Bandiera from "@/components/Bandiera";


export default function ImpiantoCardMobile({impianto, cardClient = true}) {

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
            <div className="card-body p-2">
                <div className="d-flex align-items-start gap-2">
                    <img src={URI_IMAGE + image} alt={bandiera} width={56} height={56}/>
                    <div className={'col'}>
                        <h6 className="mb-0">{nome_impianto}</h6>
                        <small className="text-muted">{gestore}</small>
                    </div>
                    <div className={'d-block'}>
                    <span className={'bg-success text-white rounded fs-1 px-2'}>{prezzo.toFixed(3)}<span style={{
                        fontSize: '0.8rem',
                    }}>€/l</span></span><br/>
                    </div>
                </div>
                <span
                    className={'small text-muted'}>{indirizzo}{comune != null ? ', ' + comune : null} {provincia != null ? `(${provincia})` : null}</span>
                {cardClient &&
                    <div className="d-flex flex-wrap gap-2 mt-2 small align-items-center">
                        <ImpiantoCardClient impianto={impianto} vicini={false} isMobile={true}/>
                        <span className={'ms-auto'}><Bandiera sigla={impianto.stato}/></span>
                    </div>}
            </div>
        </div>
    );
}
