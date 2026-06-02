import React from 'react';
import ImpiantoCardClient from "@/components/impianti/ImpiantoCardClient";
import Bandiera from "@/components/Bandiera";
import Image from "next/image";

//TODO: indicare il risparmio teorico sui 50litri
//TODO: indicare se il prezzo è discesa rispetto agli ultimi sette giorni
import DirectionsIcon from '@mui/icons-material/Directions';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

export default function ImpiantoCardMobile({impianto, cardClient = true, onClickPreferiti = null}) {

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
        <div className="border-bottom p-3" key={id_impianto}>
            <div className="">
                <a href={schedaUrl} className={'text-decoration-none text-dark'}>
                    <div className="d-flex align-items-start gap-3 mb-2">
                        <Image src={URI_IMAGE + image} alt={bandiera} width={48} height={48}/>
                        <div className={'col'}>
                            <h6 className="mb-0 text-uppercase">{nome_impianto}</h6>
                            <small className="text-muted">{gestore}</small>
                        </div>
                        <div className={'col-1 text-end'}>
                            <Bandiera sigla={impianto.stato}/></div>

                    </div>
                </a>
                <p className="text-muted small mb-0">
                    {indirizzo}{comune != null ? ', ' + comune : null} {provincia != null ? `(${provincia})` : null}
                </p>
                <p className="text-muted small mb-0">
                    <DirectionsIcon/> {impianto.distance_km.toFixed(3)} km
                    - <LocalGasStationIcon/> {tipo_impianto != null ? `${tipo_impianto}` : null}
                </p>
                {cardClient &&
                    <div className="d-flex flex-wrap gap-2 mt-2 small align-items-center">
                        <ImpiantoCardClient
                            onClickPreferiti={onClickPreferiti}
                            vicini={false} isMobile={true} impianto={impianto}/>
                        <div className={'bg-success rounded-2 text-white py-1 px-2 ms-auto'}>
                            <strong className={'fs-4'}>{prezzo} <span style={{
                                fontSize: '.8rem'
                            }}>€/L</span></strong></div>

                    </div>}
            </div>
        </div>
    );
}
