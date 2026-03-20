'use client'

import MappaRisultati from "@/components/mappe/MappaRisultati";
import {useEffect, useRef, useState} from 'react';
import {useFilters} from "@/hooks/useFilters";
import useNavBarPresence from "@/hooks/useNavBarPresence";
import BottomSheet from "@/components/BottomSheet";

export default function MappaClient({
                                        posizione,
                                        distributoriIniziali,
                                        initialFilters,
                                        zoomIniziale = 13,
                                        client = "pb"
                                    }) {

    const [animEnd, setAnimEnd] = useState(true);

    const {filters, setFilters} = useFilters(initialFilters);
    const [showList, setShowList] = useState(true);
    const [footerHeight, setFooterHeight] = useState(0);
    const [rightWidth, setRightWidth] = useState(0);
    const footerRef = useRef(null);
    const rightRef = useRef(null);

    const [distributori, setDistributori] = useState(distributoriIniziali);
    const {navBarHeight} = useNavBarPresence();

    const [step, setStep] = useState(0);
    const [showButton, setShowButton] = useState(true);

    const [viewState, setViewState] = useState({
        latitude: posizione.lat,
        longitude: posizione.lng,
        zoom: zoomIniziale,

    });
    /*
    useEffect(() => {
        if (footerRef.current) {
            setFooterHeight(footerRef.current.offsetHeight);
            // log('Footer height:', height);
        } else setFooterHeight(0);

        if (rightRef.current) {
            const value = rightRef.current.offsetWidth;
            setRightWidth(value);
        } else setRightWidth(0);


    }, []);*/

    useEffect(() => {
        // log('MAPPA CLIENT: MOUNTED');
        fetch('api/set-cookie', {method: 'POST', body: JSON.stringify(initialFilters)});

    }, []);

    useEffect(() => {
        const handleFocus = e => {
            setShowList(false);
        };

        window.addEventListener('map:focus', handleFocus);
        return () => window.removeEventListener('map:focus', handleFocus);
    }, []);
    /*
    log("MAPPA CLIENT: BUILD");
    log("FILTERS: " + JSON.stringify(filters));
    log("NAVBAR: " + navBarHeight);
        */
    return (
        <>
            <div className="position-relative full-height-dvh">
                <div className={"position-absolute top-0 start-0 w-100 h-100"}>

                    <MappaRisultati
                        showPositionButton={showButton}
                        onMoveEnd={(lat, lng, zoom) => {
                            setFilters({
                                lat: lat, lng: lng, zoom: zoom
                            })
                        }}
                        showFilter={showList}
                        initialFilters={initialFilters}
                        posizione={viewState}
                        rightWidth={rightWidth}
                        footerHeight={footerHeight}
                        distributoriIniziali={distributoriIniziali}
                        onFetchDistributori={(data) => {
                            setDistributori(data);
                        }}/>
                </div>
                <BottomSheet
                    onWidthChange={(w) => setRightWidth(w)}
                    onHeightChange={(height) => {
                        setFooterHeight(height);
                        setShowButton(step === 0)
                    }}
                    onChangeStep={(step) => {
                        setStep(step);
                        setShowList(step !== 2)
                    }}
                    distributori={distributori}/>
            </div>
        </>);

}