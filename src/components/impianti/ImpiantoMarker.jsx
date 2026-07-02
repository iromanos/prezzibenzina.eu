import {Marker} from "react-map-gl/maplibre";
import {useEffect, useState} from "react";
import Image from "next/image";

import '../../styles/map.scss';

export default function ImpiantoMarker({
                                           d, onClick,
                                           fadeOut = false,
                                           isBest = false,
                                           isEco = true, isMobile = false
                                       }) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (fadeOut) return;
        const timeout = setTimeout(() => setAnimate(true), 10); // piccolo delay
        return () => clearTimeout(timeout);
    }, []);

    function getMarkerColor() {
        if (isBest) return 'bg-success';
        if (isEco) return 'bg-success-subtle';
        return 'bg-danger-subtle';
    }

    function getBorderColor() {
        if (isBest) return 'border-white';
        if (isEco) return 'border-success';
        return 'border-danger';
    }

    return (
        <Marker

            key={d.id_impianto}
            longitude={d.longitudine}
            latitude={d.latitudine}
            anchor="bottom"
            onClick={onClick}
        >
            <div className={isBest ? 'marker-cheapest' : ''}>
            <div
                className={` 
                
                ${getMarkerColor()}                 
                ${getBorderColor()}
                position-relative
                text-center marker-badge
                
                shadow-lg
                text-dark
                border border-2  
                rounded px-1 cluster-marker ${fadeOut ? 'exit' : ''}  ${animate ? 'animate-in' : ''}`}
                 style={{
                     color: 'white',
                 }}
            >
                {isMobile === false &&
                    <Image
                        unoptimized

                        className={'d-block mx-auto bg-white rounded-circle mt-1'} alt={d.bandiera} width={32}
                           height={32}
                           src={URI_IMAGE + d.image}/>}
                <small className={isBest ? 'text-white' : null}>{d.prezzo ? d.prezzo.toFixed(3) : null}</small>
                {isBest && <div className="pulse-glow"></div>}

            </div>
            </div>
        </Marker>
    );

}