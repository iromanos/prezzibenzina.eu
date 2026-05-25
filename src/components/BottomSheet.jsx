import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {motion} from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import {usePreferitiGlobal} from "@/context/PreferitiProvider";
import InFeed4656802013 from "@/components/ads/InFeed-4656802013";
import Image from "next/image";
import Link from "next/link";
import ImpiantoCardMobile from "@/components/impianti/ImpiantoCardMobile";

const BottomSheet = forwardRef(({
                                    onChangeStep,
                                    onWidthChange,
                                    onHeightChange,
                                    onSheetHeightChange,
                                    distributori = [],
                                    client = 'pb'
                                }, ref) => {
    const [step, setStep] = useState(0);
    const [vh, setVh] = useState(0);
    const [isMobile, setIsMobile] = useState(null);

    const HEADER_HEIGHT = 78;
    const SIDEBAR_WIDTH = 400;

    const {gestisciClickCuore} = usePreferitiGlobal();


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
                    // width: isMobile ? '100%' : `${SIDEBAR_WIDTH}px`,
                    position: 'absolute',
                    top: isMobile ? `-${HEADER_HEIGHT}px` : 0,
                    right: 0,
                }}
            >
                {/* HEADER - Area Cliccabile */}
                <div
                    onClick={nextStep}
                    className={`p-3 border-bottom flex-shrink-0 ${isMobile ? 'cursor-pointer' : ''}`}
                >
                    {isMobile && (
                        <div className=" mx-auto bg-dark bg-opacity-25 rounded-pill"
                             style={{width: '40px', height: '5px'}}/>
                    )}
                    <div className="d-flex align-items-end justify-content-between">
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
                        <span className="m-0 text-dark ">
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
                    <div className="">
                        {distributori.length === 0 &&
                            <div className={'p-3'}>
                                Nessun distribuitore presente in questa zona. Prova a fare lo zoom sulla mappa o a
                                spostare la posizione.
                            </div>
                        }
                        {distributori.map((d, i) => {
                            const isAdStep = (i + 1) % 2 === 0;

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