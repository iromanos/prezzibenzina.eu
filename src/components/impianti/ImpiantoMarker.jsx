import {Marker} from "react-map-gl/maplibre";
import {useEffect, useState} from "react";

export default function ImpiantoMarker({d, onClick, fadeOut = false}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_API_ENDPOINT;

    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (fadeOut) return;
        const timeout = setTimeout(() => setAnimate(true), 10); // piccolo delay
        return () => clearTimeout(timeout);
    }, []);

    const color = d.color === -1 ? '#dc3545' : '#198754';

    return (
        <Marker
            key={d.id_impianto}
            longitude={d.longitudine}
            latitude={d.latitudine}
            anchor="bottom"
            onClick={onClick}
        >
            <div
                className={`border border-white rounded py-1 px-1 cluster-marker ${fadeOut ? 'exit' : ''}  ${animate ? 'animate-in' : ''}`}
                 style={{
                     backgroundColor: color,
                     color: 'white',
                     textAlign: 'center',
                 }}
            >
                <img className={'d-block'} alt={d.bandiera} width="32" height="32" src={URI_IMAGE + d.image}/>
                {d.prezzo ? d.prezzo.toFixed(3) : null}
            </div>
        </Marker>
    );

}