'use client'

import MappaRisultati from "@/components/mappe/MappaRisultati";
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useFilters} from "@/hooks/useFilters";
import useNavBarPresence from "@/hooks/useNavBarPresence";
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import useUltimaPosizione from "@/hooks/useUltimaPosizione";
import Link from "next/link";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import Button from "react-bootstrap/esm/Button";
import SortIcon from "@mui/icons-material/Sort";
import CampaignIcon from "@mui/icons-material/Campaign";
import ImpiantoCardMobile from "@/components/impianti/ImpiantoCardMobile";
import InFeed4656802013 from "@/components/ads/InFeed-4656802013";
import {BottomSheetSimple} from "@/components/BottomSheet";
import Display6977770298 from "@/components/ads/Display-6977770298";
import {AdsDesktop} from "@/components/ads/AdsDesktop";
import {useLaptop} from "@/hooks/useMobile";

export default function MappaClient({
                                        posizione,
                                        distributoriIniziali = [],
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

    const [topPosition, setTopPosition] = useState(0);

    const footerRef = useRef(null);
    const rightRef = useRef(null);

    const [distributori, setDistributori] = useState(distributoriIniziali);
    const [prezzoMedio, setPrezzoMedio] = useState(0);

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
            // setShowList(false);
        };

        window.addEventListener('map:focus', handleFocus);
        return () => window.removeEventListener('map:focus', handleFocus);
    }, []);

    // console.log("VIEW STATE: ", viewState);

    const handleSnapChange = (size) => {
        console.log("La bottom sheet ora è in stato:", size);
        setShowList(true);
        if (size === 'MAXIMIZED') {
            setShowList(false);
        }
    };

    const {isLaptop} = useLaptop();

    useEffect(() => {
        if (isLaptop) {
            setTopPosition(82);
        } else setTopPosition(0);
    }, [isLaptop]);

    if (viewState === null) return;

    return (
        <>
            <div

                style={{
                    height: '100svh'
                }}

                className="position-relative w-100 overflow-hidden">
                <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                    {isLaptop && <div className={'border-bottom'} style={{
                        marginRight: rightWidth
                    }}>
                        <AdsDesktop>
                            <Display6977770298/>
                        </AdsDesktop>
                    </div>}
                    <MappaRisultati
                        topPosition={topPosition}
                        cooperativeGestures={false}
                        onMapClick={() => {
                            setStep(0);
                        }}
                        showPositionButton={showButton}
                        showFilter={showList}
                        initialFilters={initialFilters}
                        posizione={viewState}
                        rightWidth={rightWidth}
                        footerHeight={footerHeight}
                        sheetHeight={sheetHeight}
                        distributoriIniziali={distributoriIniziali}
                        onPrezzoMedio={(prezzo) => {
                            setPrezzoMedio(prezzo);
                        }}
                        onFetchDistributori={(data) => {
                            setDistributori(data);
                        }}
                    /></div>

                <BottomSheetSimple
                    minHeight={100}
                    onIsMobile={(value) => {
                        if (value) {
                            setFooterHeight(100);
                            setRightWidth(0);
                        } else {
                            setFooterHeight(0);
                            setRightWidth(440);
                        }
                    }}
                    onExpanded={(value) => {
                        setShowList(!value);
                    }}
                    // onSnapChange={handleSnapChange}

                    // onResize={(width, height) => {
                    //     setRightWidth(width);
                    //     setFooterHeight(height);
                    // }}
                >
                    <SheetContent
                        distributori={distributori}
                        prezzoMedio={prezzoMedio}
                        client={client}/>
                </BottomSheetSimple>
            </div>
            {ModalComponent}
            {ModalResult}
        </>);

}


function SheetContent({
                          client,
                          prezzoMedio = 0,
                          distributori = [],
                      }) {
    const [risparmio, setRisparmio] = useState(0);
    const litri = 50;

    const [order, setOrder] = useState('Prezzo');

    const [impiantoMigliore, setImpiantoMigliore] = useState(null);

    const recordOrdinati = () => {
        const record = distributori.sort((a, b) => {
            if (order === 'Distanza') {
                return a.properties.distance_km - b.properties.distance_km;
            }
            return a.properties.prezzo - b.properties.prezzo;
        });

        return record;
    };

    useMemo(() => {

        const impianto = distributori[0]?.properties;
        if (impianto !== undefined) setRisparmio(prezzoMedio * litri - impianto.prezzo * litri);

        setImpiantoMigliore(impianto || null);
    }, [distributori]);


    return <div className={''}>
        <div className="d-flex align-items-baseline justify-content-between gap-2 p-3 border-bottom">
            <Link className={'nav-link text-primary'} href={'/'}>
                {client === 'pb' ?
                    <Image
                        width={1024}
                        height={374}
                        style={{
                            width: 'auto',
                            height: '32px'
                        }} src="/assets/svg/logo-mappa.svg" alt="PrezziBenzina.eu"
                    /> :
                    <HomeIcon/>}
            </Link>
            <Button
                className={'ms-auto'}
                onClick={() => {
                    if (order === "Prezzo") {
                        setOrder("Distanza")
                    } else setOrder("Prezzo");
                }}

                variant={'light'} size={'sm'}>{order} <SortIcon/></Button>
            <span className="m-0 small">
                            Distributori ({distributori.length})
                        </span>
        </div>


        <div className={''}>

            {prezzoMedio !== 0 &&
                <div className={'px-3 pb-2 border-bottom'}>
                    <span className={'small text-muted'}>Prezzo medio nella zona</span><p
                    className={'h1 m-0 fw-bold'}>{prezzoMedio.toFixed(3)}
                    <span className={'fw-normal fs-5'}>€/L</span></p>
                </div>}

            {impiantoMigliore !== null &&
                <div className={'bg-success-subtle shadow-sm position-relative'}>
                    <div className="bg-success text-white text-center py-2 fw-bold small text-uppercase"
                         style={{letterSpacing: '0.5px'}}>
                        <CampaignIcon/> Risparmio: € {risparmio.toFixed(2)} su un pieno di 50L
                    </div>
                    <div
                        className={'border border-success border-0 border-top-0 pb-1'}
                    >
                        <ImpiantoCardMobile
                            isBest={true}
                            onClickPreferiti={() => {
                                gestisciClickCuore(impiantoMigliore);
                            }}

                            impianto={impiantoMigliore}/>
                        <InFeed4656802013/>
                    </div>
                </div>
            }

            {recordOrdinati().length === 0 &&
                <div className={'p-3'}>
                    Nessun distribuitore presente in questa zona. Prova a fare lo zoom sulla mappa o a
                    spostare la posizione.
                </div>
            }
            {recordOrdinati().map((d, i) => {
                if (impiantoMigliore !== null && d.properties.id_impianto === impiantoMigliore.id_impianto) return null;
                const isAdStep = (i + 1) % 2 === 0;
                return <div key={i}>
                    <ImpiantoCardMobile
                        onClickPreferiti={() => {
                            gestisciClickCuore(d.properties);
                        }}

                        key={i} impianto={d.properties} cardClient={true}/>
                    {isAdStep ? <div className={'border-bottom py-3'}><InFeed4656802013/></div> : null}
                </div>

            })}
        </div>
    </div>;

}