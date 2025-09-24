'use client'

import MappaRisultati from "@/components/mappe/MappaRisultati";
import {useEffect, useRef, useState} from 'react';
import ImpiantoCard from "@/components/impianti/ImpiantoCard";
import {log} from "@/functions/helpers";

export default function MappaClient({posizione, distributoriIniziali}) {


    const [footerHeight, setFooterHeight] = useState(0);
    const footerRef = useRef(null);

    const [distributori, setDistributori] = useState(distributoriIniziali);

    const [viewState, setViewState] = useState({
        latitude: posizione.lat,
        longitude: posizione.lng,
        zoom: 13
    });

    useEffect(() => {
        if (footerRef.current) {
            const height = footerRef.current.offsetHeight;
            setFooterHeight(height);
            log('Footer height:', height);
        }
    }, [distributori.length]);


    return (
        <div className="position-relative vh-100">


            <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                <MappaRisultati posizione={viewState}
                                footerHeight={footerHeight}
                                distributoriIniziali={distributoriIniziali}
                                onFetchDistributori={(data) => {
                    setDistributori(data);
                }}/>
            </div>
            {/* Overlay filtri */}
            <div className="position-absolute top-0 end-0 p-2 z-3">
                {/*<button className="btn btn-sm btn-light">Filtri</button>*/}
            </div>

            {distributori.length !== 0 ?
                <div ref={footerRef} className="position-absolute bottom-0 w-100 z-3">
                    <div className="bg-white bg-opacity-50 shadow rounded-top-4 p-3 "
                         style={{height: '40vh', overflowY: 'auto'}}>
                        {distributori.map((d, i) =>
                            <ImpiantoCard key={i} impianto={d} cardClient={false}/>
                        )}
                    </div>
                </div> : null}
        </div>);

}