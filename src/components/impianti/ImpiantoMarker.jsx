import {Marker} from "react-map-gl/maplibre";
import {useEffect, useState} from "react";
import Image from "next/image";

import '../../styles/map.scss';

export default function ImpiantoMarker({d, onClick, fadeOut = false, isBest = false}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (fadeOut) return;
        const timeout = setTimeout(() => setAnimate(true), 10); // piccolo delay
        return () => clearTimeout(timeout);
    }, []);

    const color = getMarkerColor(d);
    function getMarkerColor(d) {
        // if (d.color === 0) return 'bg-success';
        // if (d.color === -1) return 'bg-danger';

        if (isBest) return 'bg-success';

        return 'bg-light-subtle';
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
                className={` ${color} 
                position-relative
                text-center marker-badge
                pt-1
                shadow-lg
                text-dark
                border border-1 border-dark-subtle 
                rounded px-1 cluster-marker ${fadeOut ? 'exit' : ''}  ${animate ? 'animate-in' : ''}`}
                 style={{
                     color: 'white',
                 }}
            >
                <Image className={'d-block mx-auto'} alt={d.bandiera} width={32} height={32}
                     src={URI_IMAGE + d.image}/>
                <small className={isBest ? 'text-white' : null}>{d.prezzo ? d.prezzo.toFixed(3) : null}</small>
                {isBest && <div className="pulse-glow"></div>}

            </div>
            </div>
        </Marker>
    );

}