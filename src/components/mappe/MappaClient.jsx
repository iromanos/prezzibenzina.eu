'use client'

import MappaRisultati from "@/components/mappe/MappaRisultati";
import {useEffect, useRef, useState} from 'react';
import ImpiantoCard from "@/components/impianti/ImpiantoCard";
import {log} from "@/functions/helpers";
import {useFilters} from "@/hooks/useFilters";
import Button from "react-bootstrap/Button";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {AnimatePresence, motion} from 'framer-motion';
import useNavBarPresence from "@/hooks/useNavBarPresence";

export default function MappaClient({posizione, distributoriIniziali, initialFilters}) {
    const {filters} = useFilters(initialFilters);
    const [showList, setShowList] = useState(false);
    const [footerHeight, setFooterHeight] = useState(0);
    const [rightWidth, setRightWidth] = useState(0);
    const footerRef = useRef(null);
    const rightRef = useRef(null);

    const [distributori, setDistributori] = useState(distributoriIniziali);
    const {navBarHeight} = useNavBarPresence();


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

    const handleAnimationComplete = () => {
        if (footerRef.current) {
            const height = footerRef.current.offsetHeight;
            setFooterHeight(height);
            log('Footer height:', height);
        } else setFooterHeight(0);
    };

    useEffect(() => {
        log('MAPPA CLIENT: MOUNTED');
        fetch('api/set-cookie', {method: 'POST', body: JSON.stringify(initialFilters)});

    }, []);

    useEffect(() => {
        const handleFocus = e => {
            setShowList(false);
        };

        window.addEventListener('map:focus', handleFocus);
        return () => window.removeEventListener('map:focus', handleFocus);
    }, []);

    log("MAPPA CLIENT: BUILD");
    log("FILTERS: " + JSON.stringify(filters));
    log("NAVBAR: " + navBarHeight);

    return (
        <>
            <div className="position-relative vh-100">
                <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                    <MappaRisultati
                        initialFilters={initialFilters}
                        posizione={viewState}
                                    rightWidth={rightWidth}
                                    footerHeight={footerHeight}
                                    distributoriIniziali={distributoriIniziali}
                                    onFetchDistributori={(data) => {
                                        setDistributori(data);
                                    }}/>
                </div>
                <div ref={footerRef}

                     style={{paddingBottom: navBarHeight}}

                     className="position-absolute bottom-0 w-100 z-3 d-lg-none">
                    <div className={`bg-white bg-opacity-75 shadow rounded-top-4 p-3`}
                         style={{overflowY: 'auto'}}>
                        <div className={'d-flex align-items-center justify-content-between'}>
                            <h6 className="fw-semibold mb-0">Distributori trovati ({distributori.length})</h6>
                            {distributori.length !== 0 ? <Button

                                onClick={() => {
                                    setShowList(!showList);
                                }}

                                variant={'outline-dark'} size={'sm'}><FormatListBulletedIcon/> Elenco</Button> : null}
                        </div>

                        {distributori.length !== 0 ?
                            <AnimatePresence>
                                {showList && (

                                    <motion.div
                                        onAnimationComplete={handleAnimationComplete}
                                        initial={{height: 0, opacity: 0}}
                                        animate={{height: 'auto', opacity: 1}}
                                        exit={{height: 0, opacity: 0}}
                                        transition={{duration: 0.3}}
                                        style={{maxHeight: '40vh'}}
                                    >
                                        <div className={'py-3'}>
                                            {distributori.map((d, i) =>
                                <ImpiantoCard key={i} impianto={d} cardClient={true}/>
                                            )}</div>
                                    </motion.div>)}</AnimatePresence> :
                            <p className={'m-0'}>Nessun distributore in zona per i filtri selezionati</p>
                        }
                    </div>
                </div>

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

            </div>
        </>);

}