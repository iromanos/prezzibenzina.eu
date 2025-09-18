import {Marker} from "react-map-gl/maplibre";

export default function ImpiantoMarker({d, onClick}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_API_ENDPOINT;


    const color = d.color === -1 ? '#dc3545' : '#198754';

    return (
        <Marker
            key={d.id_impianto}
            longitude={d.longitudine}
            latitude={d.latitudine}
            anchor="bottom"
            onClick={onClick}
        >
            <div className={'border border-white rounded py-1 px-1'}
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