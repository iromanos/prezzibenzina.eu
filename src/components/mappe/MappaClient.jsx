'use client'

import MappaRisultati from "@/components/mappe/MappaRisultati";
import {useEffect, useRef, useState} from 'react';
import ImpiantoCard from "@/components/impianti/ImpiantoCard";
import {log} from "@/functions/helpers";

export default function MappaClient({posizione, distributoriIniziali}) {


    const [footerHeight, setFooterHeight] = useState(0);
    const [rightWidth, setRightWidth] = useState(0);
    const footerRef = useRef(null);
    const rightRef = useRef(null);

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
        } else setFooterHeight(0);

        if (rightRef.current) {
            const value = rightRef.current.offsetWidth;
            setRightWidth(value);
        } else setRightWidth(0);


    }, [distributori]);


    useEffect(() => {
        log('MAPPA CLIENT: MOUNTED');
        fetch('api/set-cookie', {method: 'POST'});
    }, []);

    log("MAPPA CLIENT: BUILD");

    return (
        <div className="position-relative vh-100">
            <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                <MappaRisultati posizione={viewState}
                                rightWidth={rightWidth}
                                footerHeight={footerHeight}
                                distributoriIniziali={distributoriIniziali}
                                onFetchDistributori={(data) => {
                                    setDistributori(data);
                                }}/>
            </div>
            <div ref={footerRef} className="position-absolute bottom-0 w-100 z-3 d-lg-none">
                <div className="bg-white bg-opacity-50 shadow rounded-top-4 p-3 "
                     style={{maxHeight: '40vh', overflowY: 'auto'}}>
                    <h6 className="fw-semibold mb-3">Distributori trovati ({distributori.length})</h6>
                    {distributori.length !== 0 ?

                        distributori.map((d, i) =>
                            <ImpiantoCard key={i} impianto={d} cardClient={false}/>
                        ) :
                        <p className={''}>Nessun distributore in zona per i filtri selezionati</p>
                    }
                </div>
            </div>

            {/* Sidebar desktop */}
            <div
                ref={rightRef}
                className="d-none d-lg-block position-fixed top-0 end-0 h-100 bg-white bg-opacity-75 shadow border-start p-3"
                style={{width: '420px', overflowY: 'auto', zIndex: 1030}}>
                <h6 className="fw-semibold mb-3">Distributori trovati ({distributori.length})</h6>
                {distributori.length !== 0 ? (
                    distributori.map((d, i) => (
                        <ImpiantoCard key={i} impianto={d}/>
                    ))
                ) : (
                    <p className="">Nessun distributore in zona per i filtri selezionati</p>
                )}
            </div>

        </div>);

}