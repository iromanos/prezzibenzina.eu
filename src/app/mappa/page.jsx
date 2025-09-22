import MappaWrapper from "@/components/MappaWrapper";
import MappaRisultati from "@/components/mappe/MappaRisultati";
import {getImpiantiByDistance} from "@/functions/api";


export default async function Mappa({searchParams}) {

    const params = await searchParams;

    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);

    const posizione = {
        lat: lat ? lat : 45.46,
        lng: lng? lng : 9.19
    };


    const response = await getImpiantiByDistance(posizione.lat, posizione.lng, 10, 'benzina', 'price', 10);

    const distributori = await response.json();

    return (
        <div className="position-relative vh-100">
            <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                <MappaRisultati posizione={posizione} />
            </div>
            {/* Overlay filtri */}
            <div className="position-absolute top-0 end-0 p-2 z-3">
                <button className="btn btn-sm btn-light">Filtri</button>
            </div>

            {/* Lista distributori */}

            {distributori.length !== 0 ?

                <div className="position-absolute bottom-0 w-100 z-3">
                    <div className="bg-white shadow rounded-top p-3" style={{maxHeight: '40vh', overflowY: 'auto'}}>
                        {distributori.map((d, i) => (
                            <div key={i} className="mb-2">
                                <div className="fw-bold">{d.nome}</div>
                                <div className="text-muted small">{d.indirizzo}</div>
                                <div className="text-end text-muted">{d.prezzo} €/L</div>
                            </div>
                        ))}
                    </div>
                </div> : null}
        </div>
    );
}
