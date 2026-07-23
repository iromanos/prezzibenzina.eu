import React from 'react';
import ImpiantoCardClient from "@/components/impianti/ImpiantoCardClient";
import Bandiera from "@/components/Bandiera";
import Image from "next/image";

import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';

export default function ImpiantoCardMobile({impianto, cardClient = true, onClickPreferiti = null, isBest = false}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

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
        <div className={isBest ? 'p-3' : 'p-3 border-bottom'}
             key={id_impianto}>
            <div className="">
                <a href={schedaUrl} className={'text-decoration-none text-dark'}>
                    <div className="d-flex align-items-start gap-3 mb-2">
                        <div className={'col'}>
                            <p className="mb-0 text-uppercase h6">{nome_impianto}</p>
                            {impianto.stato === "CH" &&
                                <><p className="text-muted small mb-0">
                                    {indirizzo}{comune != null ? ', ' + comune : null} {provincia != null ? `(${provincia})` : null}
                                </p>

                                    {impianto.distance_km !== null &&

                                    <span
                                        className={'small text-muted align-items-center d-flex gap-1'}><DirectionsCarFilledIcon/> {impianto.distance_km.toFixed(3)} km</span>}</>
                            }
                            {/*{impianto.stato === "IT" && <small className="text-muted">{gestore}</small>}*/}

                            {impianto.stato === "IT" &&
                                <><p className="text-muted small mb-2">
                                    {indirizzo}{comune != null ? ', ' + comune : null} {provincia != null ? `(${provincia})` : null}
                                </p>
                                    <p className="text-muted small mb-2 align-items-center d-flex gap-1 flex-wrap">
                                        {impianto.distance_km && <>
                                            <DirectionsCarFilledIcon/> {impianto.distance_km.toFixed(3)} km
                                            - </>}

                                        <span
                                            className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1.5 fw-normal"
                                        >{tipo_impianto}</span>

                                        {impianto.impianto_servizi && impianto.impianto_servizi.services.map((service) => (
                                            <span
                                                key={service.id}
                                                className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1.5 fw-normal"
                                            >{service.description}</span>
                                        ))}

                                    </p></>}


                        </div>
                        <div className={'text-center'}>
                            <Image
                                className={'d-block'}
                                unoptimized
                                src={URI_IMAGE + image} alt={bandiera} width={48} height={48}/>
                            <Bandiera sigla={impianto.stato}/></div>

                    </div>
                </a>
                {cardClient &&
                    <div className="d-flex flex-wrap gap-2 mt-2 small align-items-center">
                        <ImpiantoCardClient
                            onClickPreferiti={onClickPreferiti}
                            vicini={false} isMobile={true} impianto={impianto}/>
                        <div
                            className={'bg-success rounded-2 text-white px-2 ms-auto' + (isBest ? ' shadow' : '')}>
                            <span className={'fs-5 fw-bold'}>{prezzo.toFixed(3)} <span style={{
                                fontSize: '.8rem'
                            }}>€/L</span></span></div>

                    </div>}
            </div>
        </div>
    );
}
