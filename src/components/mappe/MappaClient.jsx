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
    const [sheetHeight, setSheetHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(58);
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
                        onMapClick={() => {
                            setStep(0);
                            setShowList(true);
                            footerRef.current.setStep(0);
                        }}
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
                        sheetHeight={sheetHeight}
                        distributoriIniziali={distributoriIniziali}
                        onFetchDistributori={(data) => {
                            setDistributori(data);
                        }}/>
                </div>
                <BottomSheet

                    ref={footerRef}

                    onWidthChange={(w) => {
                        console.log("FOOTER WIDTH: " + w);
                        setRightWidth(w);
                    }}
                    onHeightChange={(height) => {
                        console.log("FOOTER HEIGHT: " + height);
                        setFooterHeight(height);
                    }}
                    onChangeStep={(step) => {
                        setStep(step);
                        setShowList(step !== 2)
                    }}
                    onSheetHeightChange={(h) => {
                        console.log("SHEET HEIGHT: " + h);
                        setSheetHeight(h);
                    }}
                    distributori={distributori}/>
            </div>
        </>);

}