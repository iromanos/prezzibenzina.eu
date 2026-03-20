import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {motion} from 'framer-motion';
import ImpiantoCard from "@/components/impianti/ImpiantoCard";

const BottomSheet = forwardRef(({onChangeStep, onWidthChange, onHeightChange, distributori = []}, ref) => {
    const [step, setStep] = useState(0);
    const [vh, setVh] = useState(0);
    const [isMobile, setIsMobile] = useState(null);

    const HEADER_HEIGHT = 80;
    const SIDEBAR_WIDTH = 400;

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 768;
            setVh(window.innerHeight);
            setIsMobile(mobile);

            if (!mobile) {
                setStep(1);
                // Comunichiamo la larghezza al genitore se siamo su desktop
                if (onWidthChange) onWidthChange(SIDEBAR_WIDTH);
            } else {
                // Su mobile la larghezza "laterale" occupata è 0
                if (onWidthChange) onWidthChange(0);
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
            "2": {y: -(vh * 0.85)}
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
            // CRITICO: Su mobile width 100%, su desktop width SIDEBAR
            className={`z-3 pointer-events-none ${isMobile ? 'fixed-bottom w-100' : 'position-fixed end-0 top-0 h-100'}`}
            style={{
                height: isMobile ? 0 : '100vh',
                width: isMobile ? '100%' : `${SIDEBAR_WIDTH}px`,
                overflow: 'visible'
            }}
        >
            {/* Overlay: solo mobile e solo se aperto */}
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
                        // Calcoliamo l'altezza basandoci sulla variante corrente
                        const currentY = variants.mobile[step].y;
                        onHeightChange(HEADER_HEIGHT + Math.abs(currentY));
                    }
                }}
                className={`bg-white shadow-lg pointer-events-auto d-flex flex-column border ${
                    isMobile ? 'rounded-top-4 w-100' : 'h-100 border-start'
                }`}
                style={{
                    height: isMobile ? '90vh' : '100vh',
                    width: isMobile ? '100%' : `${SIDEBAR_WIDTH}px`,
                    position: 'absolute',
                    // Su mobile ancorato a -80px dal fondo, su desktop a 0
                    top: isMobile ? `-${HEADER_HEIGHT}px` : 0,
                    right: 0,
                }}
            >
                {/* HEADER - Area Cliccabile */}
                <div
                    onClick={nextStep}
                    className={`p-3 border-bottom flex-shrink-0 ${isMobile ? 'cursor-pointer' : ''}`}
                    style={{height: `${isMobile ? HEADER_HEIGHT : HEADER_HEIGHT - 16}px`, touchAction: 'none'}}
                >
                    {isMobile && (
                        <div className="mx-auto bg-dark bg-opacity-25 rounded-pill mb-3"
                             style={{width: '40px', height: '5px'}}/>
                    )}
                    <div className="d-flex justify-content-between align-items-center px-2">
                        <h5 className="m-0 fw-bold text-dark">
                            Distributori ({distributori.length})
                        </h5>
                    </div>
                </div>

                {/* LISTA */}
                <div
                    className="overflow-y-auto flex-grow-1"
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        // Importante: riabilitiamo i pointer events solo se non siamo in "peek" su mobile
                        pointerEvents: (isMobile && step === 0) ? 'none' : 'auto',
                    }}
                >
                    <div className="p-3">
                        {distributori.map((d, i) => (
                            <ImpiantoCard key={i} impianto={d.properties} cardClient={true}/>
                        ))}
                        {/* Padding extra per lo scroll mobile */}
                        {isMobile && <div style={{height: '120px'}}/>}
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

BottomSheet.displayName = 'BottomSheet';
export default BottomSheet;