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

    const color = getMarkerColor(d);
    function getMarkerColor(d) {
        if (d.color === 0) return 'bg-success';
        if (d.color === 1) return 'bg-warning';
        return 'bg-danger';
    }

    return (
        <Marker
            key={d.id_impianto}
            longitude={d.longitudine}
            latitude={d.latitudine}
            anchor="bottom"
            onClick={onClick}
        >
            <div
                className={` ${color} text-center border border-white rounded py-1 px-1 cluster-marker ${fadeOut ? 'exit' : ''}  ${animate ? 'animate-in' : ''}`}
                 style={{
                     color: 'white',
                 }}
            >
                <img className={'d-block mx-auto my-1'} alt={d.bandiera} width="32" height="32"
                     src={URI_IMAGE + d.image}/>
                <small>{d.prezzo ? d.prezzo.toFixed(3) : null}</small>
            </div>
        </Marker>
    );

}