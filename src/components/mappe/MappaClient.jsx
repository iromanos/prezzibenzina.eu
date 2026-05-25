'use client'

import MappaRisultati from "@/components/mappe/MappaRisultati";
import {useEffect, useRef, useState} from 'react';
import {useFilters} from "@/hooks/useFilters";
import useNavBarPresence from "@/hooks/useNavBarPresence";
import BottomSheet from "@/components/BottomSheet";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import useUltimaPosizione from "@/hooks/useUltimaPosizione";

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

    const hookUltimaPosizione = useUltimaPosizione();

    // console.log("ULTIMA POSIZIONE: ", hookUltimaPosizione.posizione);

    const [viewState, setViewState] = useState(null);

    const {ModalComponent, ModalResult} = usePreferitiGlobal();


    useEffect(() => {
        if (hookUltimaPosizione.posizione === null) return;

        if (hookUltimaPosizione.posizione === false) {
            setViewState({
                latitude: posizione.lat,
                longitude: posizione.lng,
                zoom: zoomIniziale,
            });
            return;
        }
        // console.log('AGGIORNA VIEW STATE CON ULTIMA POSIZIONE: ', hookUltimaPosizione.posizione);
        setViewState({
            latitude: hookUltimaPosizione.posizione.center.lat,
            longitude: hookUltimaPosizione.posizione.center.lng,
            zoom: hookUltimaPosizione.posizione.zoom
        });
    }, [hookUltimaPosizione.posizione]);

    useEffect(() => {
        const handleFocus = e => {
            setShowList(false);
        };

        window.addEventListener('map:focus', handleFocus);
        return () => window.removeEventListener('map:focus', handleFocus);
    }, []);

    // console.log("VIEW STATE: ", viewState);

    if (viewState === null) return;

    return (
        <>
            <div className="position-relative full-height-dvh">
                <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                    <MappaRisultati
                        cooperativeGestures={false}
                        onMapClick={() => {
                            setStep(0);
                            setShowList(true);
                            footerRef.current.setStep(0);
                        }}
                        showPositionButton={showButton}
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
                        setRightWidth(w);
                    }}
                    onHeightChange={(height) => {
                        setFooterHeight(height);
                    }}
                    onChangeStep={(step) => {
                        setStep(step);
                        setShowList(step !== 2)
                    }}
                    onSheetHeightChange={(h) => {
                        setSheetHeight(h);
                    }}
                    distributori={distributori}/>
            </div>
            {ModalComponent}
            {ModalResult}
        </>);

}