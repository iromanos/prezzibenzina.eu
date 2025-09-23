'use client'

import MappaRisultati from "@/components/mappe/MappaRisultati";
import {useState} from "react";
import ImpiantoCard from "@/components/impianti/ImpiantoCard";

export default function MappaClient({posizione, distributoriIniziali}) {


    const [distributori, setDistributori] = useState(distributoriIniziali);

    const [viewState, setViewState] = useState({
        latitude: posizione.lat,
        longitude: posizione.lng,
        zoom: 13
    });

    return (
        <div className="position-relative vh-100">
            <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                <MappaRisultati posizione={viewState}
                                distributoriIniziali={distributoriIniziali} onFetchDistributori={(data) => {
                    setDistributori(data);
                }}/>
            </div>
            {/* Overlay filtri */}
            <div className="position-absolute top-0 end-0 p-2 z-3">
                {/*<button className="btn btn-sm btn-light">Filtri</button>*/}
            </div>

            {distributori.length !== 0 ?

                <div className="position-absolute bottom-0 w-100 z-3">
                    <div className="bg-white shadow rounded-top p-3 " style={{height: '40vh', overflowY: 'auto'}}>
                        {distributori.map((d, i) =>
                            <ImpiantoCard key={i} impianto={d} cardClient={false}/>
                        )}
                    </div>
                </div> : null}
        </div>);

}