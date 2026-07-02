import React from 'react';
import ImpiantoCardClient from "@/components/impianti/ImpiantoCardClient";
import Bandiera from "@/components/Bandiera";
import Image from "next/image";

//TODO: indicare se il prezzo è discesa rispetto agli ultimi sette giorni
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
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
                        <Image

                            unoptimized
                            src={URI_IMAGE + image} alt={bandiera} width={48} height={48}/>
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
                            {impianto.stato === "IT" && <small className="text-muted">{gestore}</small>}
                        </div>
                        <div className={'col-1 text-end'}>
                            <Bandiera sigla={impianto.stato}/></div>

                    </div>
                </a>
                {impianto.stato === "IT" &&
                    <><p className="text-muted small mb-0">
                    {indirizzo}{comune != null ? ', ' + comune : null} {provincia != null ? `(${provincia})` : null}
                </p>
                        <p className="text-muted small mb-0 align-items-center d-flex gap-1">
                            {impianto.distance_km !== null && <>
                                <DirectionsCarFilledIcon/> {impianto.distance_km.toFixed(3)} km
                                - </>}<LocalGasStationIcon/> {tipo_impianto != null ? `${tipo_impianto}` : null}
                        </p></>}
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
