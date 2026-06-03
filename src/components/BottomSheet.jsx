import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from 'react';
import {motion} from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import InFeed4656802013 from "@/components/ads/InFeed-4656802013";
import Image from "next/image";
import Link from "next/link";
import ImpiantoCardMobile from "@/components/impianti/ImpiantoCardMobile";
import SortIcon from '@mui/icons-material/Sort';
import Button from 'react-bootstrap/Button';

import CampaignIcon from '@mui/icons-material/Campaign';

const BottomSheet = forwardRef(({
                                    onChangeStep,
                                    onWidthChange,
                                    onHeightChange,
                                    onSheetHeightChange,
                                    distributori = [],
                                    prezzoMedio = 0,
                                    client = 'pb'
                                }, ref) => {
    const [step, setStep] = useState(0);
    const [vh, setVh] = useState(0);
    const [isMobile, setIsMobile] = useState(null);

    const HEADER_HEIGHT = 78;
    const SIDEBAR_WIDTH = 400;

    const {gestisciClickCuore} = usePreferitiGlobal();

    const [order, setOrder] = useState('Prezzo');

    const [risparmio, setRisparmio] = useState(0);
    const litri = 50;

    useEffect(() => {
        if (isMobile) {
            onHeightChange(HEADER_HEIGHT);
        } else onHeightChange(0)
    }, [isMobile]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width <= 768;
            setVh(window.innerHeight);
            setIsMobile(mobile);

            if (!mobile) {
                setStep(1);
                // Comunichiamo la larghezza al genitore se siamo su desktop
                if (onWidthChange) onWidthChange(SIDEBAR_WIDTH);
            } else {
                // Su mobile la larghezza "laterale" occupata è 0
                if (onWidthChange) {
                    onWidthChange(0);
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [onWidthChange]); // Aggiunto onWidthChange alle dipendenze

    // Varianti: su desktop usiamo x: 0 fisso, su mobile usiamo y
    const variants = {
        mobile: {
            "0": {y: 0, x: 0},
            "1": {y: -(vh * 0.4)},
            "2": {y: -(vh * 0.75)}
        },
        desktop: {
            "0": {x: 0, y: 0},
            "1": {x: 0, y: 0},
            "2": {x: 0, y: 0}
        }
    };

    useImperativeHandle(ref, () => ({
        currentStep: step,
        setStep: (s) => setStep(s)
    }));

    const nextStep = (e) => {
        // Impediamo la propagazione se necessario
        if (isMobile) {
            setStep((oldStep) => {
                const newStep = (oldStep + 1) % 3;
                if (onChangeStep) onChangeStep(newStep);
                return newStep;
            });
        }
    };


    const recordOrdinati = () => {
        const record = distributori.sort((a, b) => {
            if (order === 'Distanza') {
                return a.properties.distance_km - b.properties.distance_km;
            }
            return a.properties.prezzo - b.properties.prezzo;
        });

        return record;
    };

    const [impiantoMigliore, setImpiantoMigliore] = useState(null);

    useMemo(() => {

        const impianto = distributori[0]?.properties;
        if (impianto !== undefined) setRisparmio(prezzoMedio * litri - impianto.prezzo * litri);

        setImpiantoMigliore(impianto || null);
    }, [distributori]);


    if (isMobile === null) return null;


    return (
        <div
            className={`z-3 pointer-events-none ${isMobile ? 'fixed-bottom w-100' : 'position-fixed end-0 top-0 h-100'}`}
            style={{
                height: isMobile ? 0 : '100vh',
                width: isMobile ? '100%' : `${SIDEBAR_WIDTH}px`,
                overflow: 'visible'
            }}>
            {isMobile && step > 0 && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 pointer-events-auto"
                    style={{zIndex: -1, height: '100vh', bottom: 0, left: 0, right: 0}}
                    onClick={() => setStep(0)}
                />
            )}

            <motion.div
                variants={isMobile ? variants.mobile : variants.desktop}
                animate={String(step)}
                initial={isMobile ? "0" : "1"}
                transition={{type: "spring", damping: 25, stiffness: 200}}
                onAnimationComplete={() => {
                    if (onHeightChange && isMobile) {
                        const currentY = variants.mobile[step].y;
                        onSheetHeightChange(HEADER_HEIGHT + Math.abs(currentY));
                    }
                }}
                className={`bg-white shadow-lg pointer-events-auto d-flex flex-column border ${
                    isMobile ? 'rounded-top-4 w-100' : 'h-100 border-start'
                }`}
                style={{
                    height: isMobile ? '100vh' : '100vh',
                    width: '100%',
                    position: 'absolute',
                    top: isMobile ? `-${HEADER_HEIGHT}px` : 0,
                    right: 0,
                }}
            >
                {/* HEADER - Area Cliccabile */}
                <div
                    className={`p-3 border-bottom flex-shrink-0 ${isMobile ? 'cursor-pointer' : ''}`}
                >
                    {isMobile && (
                        <div

                            onClick={nextStep}

                            className=" mx-auto bg-dark bg-opacity-25 rounded-pill mb-2"
                             style={{width: '40px', height: '5px'}}/>
                    )}
                    <div className="d-flex align-items-baseline justify-content-between gap-2">
                        <Link className={'nav-link text-primary'} href={'/'}>
                            {client === 'pb' ?
                                <Image
                                    width={1024}
                                    height={374}
                                    style={{
                                        width: 'auto',
                                        height: '40px'
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
                </div>


                <div
                    className="overflow-y-auto flex-grow-1"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        pointerEvents: (isMobile && step === 0) ? 'none' : 'auto',
                    }}
                >
                    {prezzoMedio !== 0 &&
                        <div className={'p-3 '}>
                            <span className={'small text-muted'}>Prezzo medio nella zona</span><p
                            className={'display-4 m-0'}>{prezzoMedio.toFixed(3)}
                            <span className={'fw-normal fs-5'}>€/L</span></p>
                        </div>}
                    <div className="">

                        {impiantoMigliore !== null &&
                            <div className={'bg-success-subtle rounded-3 shadow-sm position-relative'}>
                                <div
                                    className="bg-success text-white text-center py-2 fw-bold small text-uppercase rounded-top-3"
                                    style={{letterSpacing: '0.5px'}}>
                                    <CampaignIcon/> Risparmio: € {risparmio.toFixed(2)} su un pieno di 50L
                                </div>
                                <div className={'border border-success border-3 rounded-bottom-3 border-top-0'}>
                                    <ImpiantoCardMobile
                                        isBest={true}
                                        onClickPreferiti={() => {
                                            gestisciClickCuore(impiantoMigliore);
                                        }}

                                        impianto={impiantoMigliore}/>
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
                            const isAdStep = (i + 1) % 2 === 0;
                            if (impiantoMigliore !== null && d.properties.id_impianto === impiantoMigliore.id_impianto) return null;
                            return <div key={i}>
                                <ImpiantoCardMobile
                                    onClickPreferiti={() => {
                                        gestisciClickCuore(d.properties);
                                    }}

                                    key={i} impianto={d.properties} cardClient={true}/>
                                {isAdStep ? <div className={'border-bottom'}><InFeed4656802013/></div> : null}
                            </div>

                        })}
                        {isMobile && step !== 2 && <div style={{height: '320px'}}/>}
                        {isMobile && step === 2 && <div style={{height: `${HEADER_HEIGHT + 8}px`}}/>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

BottomSheet.displayName = 'BottomSheet';
export default BottomSheet;