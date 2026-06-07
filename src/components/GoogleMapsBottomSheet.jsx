'use client'
import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from "motion/react";

export const GoogleMapsBottomSheet = ({children, isOpen, onClose, onSnapChange}) => {
    const contentRef = useRef(null);
    const sheetRef = useRef(null);

    // Punti di ancoraggio (in pixel dal fondo dello schermo)
    const [snapPoints, setSnapPoints] = useState([80, 350, 700]);
    const [currentTranslateY, setCurrentTranslateY] = useState(350); // Posizione corrente del foglio
    const [isDesktop, setIsDesktop] = useState(false);

    // Dati di tracciamento del tocco sulla maniglia
    const startY = useRef(0);
    const startTranslateY = useRef(0);

    // Mappiamo gli indici degli snap point a stringhe leggibili per il Parent
    const SNAP_LABELS = {
        0: 'MINIMIZED',
        1: 'MID',
        2: 'MAXIMIZED'
    };

    useEffect(() => {
        if (contentRef.current == null) return;
        contentRef.current.scrollTop = 0;
    }, [currentTranslateY])

    // 1. Configurazione Responsive (Mobile vs Desktop)
    useEffect(() => {
        const handleResize = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (vw >= 992) {
                setIsDesktop(true);
            } else {
                setIsDesktop(false);
                const chiuso = 96;         // Altezza minima (anteprima permanente)
                const meta = 320; //Math.floor(vh * 0.45);   // 45% dello schermo
                const massimo = Math.floor(vh * 0.88); // 88% dello schermo (evita la barra in alto)

                setSnapPoints([chiuso, meta, massimo]);

                // Se è impostato su aperto, va a metà, altrimenti sta al minimo
                setCurrentTranslateY(isOpen ? meta : chiuso);

                // Comunica lo stato iniziale al parent
                if (onSnapChange) {
                    onSnapChange(isOpen ? 'MID' : 'MINIMIZED');
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    // 2. Controllo dell'apertura/chiusura tramite le Props
    useEffect(() => {
        if (isDesktop) return;
        setCurrentTranslateY(isOpen ? snapPoints[1] : snapPoints[0]);

        if (onSnapChange) {
            onSnapChange(isOpen ? 'MID' : 'MINIMIZED');
        }
    }, [isOpen, snapPoints, isDesktop]);

    // 3. GESTIONE DEL TRASCINAMENTO NATIVO (Solo sulla Maniglia)
    const handleTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
        startTranslateY.current = currentTranslateY;

        // Disattiva le transizioni CSS durante il trascinamento per muoversi in tempo reale col dito
        if (sheetRef.current) sheetRef.current.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
        const currentTouchY = e.touches[0].clientY;
        const deltaY = currentTouchY - startY.current; // Pixel mossi dal dito (positivo = giù, negativo = su)

        // Calcoliamo la nuova altezza potenziale del foglio
        let newHeight = startTranslateY.current - deltaY;

        // Vincoliamo il movimento tra lo snap minimo e quello massimo (Non può sparire o andare oltre il top)
        if (newHeight < snapPoints[0]) newHeight = snapPoints[0];
        if (newHeight > snapPoints[2]) newHeight = snapPoints[2];

        setCurrentTranslateY(newHeight);
    };

    const handleTouchEnd = () => {
        // Riattiviamo l'animazione fluida CSS per lo scatto (snap) finale
        if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        }

        // Trova l'indice dello snap point più vicino
        const closestIndex = snapPoints.reduce((prevIdx, currVal, currIdx) => {
            const prevVal = snapPoints[prevIdx];
            return Math.abs(currentTranslateY - currVal) < Math.abs(currentTranslateY - prevVal) ? currIdx : prevIdx;
        }, 0);

        const closestPoint = snapPoints[closestIndex];

        setCurrentTranslateY(closestPoint);

        // 🔑 SCATENA LA CALLBACK AL PARENT CON IL NUOVO STATO
        if (onSnapChange) {
            onSnapChange(SNAP_LABELS[closestIndex]);
        }

        // Se l'utente ha voluto chiudere il pannello (portandolo al punto minimo), lo notifichiamo al padre
        if (closestPoint === snapPoints[0] && onClose) {
            onClose();
        }
    };

    // 4. Stili CSS applicati in base al dispositivo
    const desktopStyle = {
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        zIndex: 1050,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out'
    };

    const mobileStyle = {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: `${snapPoints[2]}px`, // Altezza totale pari allo snap massimo
        zIndex: 1050,
        borderTopLeftRadius: '1.5rem',
        borderTopRightRadius: '1.5rem',
        // Spostiamo fisicamente l'intero foglio usando la GPU (Massima fluidità su iOS/Chrome)
        transform: `translateY(${snapPoints[2] - currentTranslateY}px)`,
        transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        backgroundColor: '#ffffff',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.15)',
    };

    if (isDesktop && !isOpen) return null;

    return (
        <div
            ref={sheetRef}
            className={`bg-white border-top ${isDesktop ? 'position-absolute border-start shadow-lg' : ''}`}
            style={isDesktop ? desktopStyle : mobileStyle}
        >
            {/* 🛠️ LA MANIGLIA (Unica area sensibile al tocco per muovere il pannello) */}
            {!isDesktop && (
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="w-100 d-flex justify-content-center py-2"
                    style={{
                        cursor: 'grab',
                        touchAction: 'none', // 🔑 BLOCCO TOTALE: Dice a Chrome di ignorare Pull-to-Refresh e swipe nativi
                        backgroundColor: '#ffffff',
                        borderTopLeftRadius: '1.5rem',
                        borderTopRightRadius: '1.5rem',
                        userSelect: 'none'
                    }}
                >
                    <div className="rounded-pill" style={{width: '50px', height: '6px', backgroundColor: '#dee2e6'}}/>
                </div>
            )}

            {/* Header fisso (Solo per versione Desktop) */}
            {isDesktop && (
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="m-0 fw-bold text-secondary">Dettagli</h5>
                    <button className="btn-close" onClick={onClose}></button>
                </div>
            )}

            {/* 📜 IL CONTENUTO (Interamente isolato, scrolla normalmente e non interferisce mai con il pannello) */}
            <div
                ref={contentRef}
                className="pb-5 overflow-auto"
                style={{
                    height: `calc(100% - 50px)`,
                    maxHeight: isDesktop ? 'calc(100vh - 75px)' : 'calc(100% - 40px)',
                    WebkitOverflowScrolling: 'touch', // Scroll burro su iOS
                    touchAction: 'auto', // Lascia lo scroll verticale standard dentro il testo
                }}
            >
                {children}

                {!isDesktop && (
                    <div className="pt-3 pb-5">
                        <button className="btn btn-light w-100 rounded-pill" onClick={() => {
                            setCurrentTranslateY(snapPoints[0]);
                            if (onSnapChange) onSnapChange('MINIMIZED');
                            if (onClose) onClose();
                        }}>
                            Chiudi scheda
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


export function BottomSheet({isOpen, onClose, children}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* OVERLAY (Sfondo scuro) */}
                    <motion.div
                        className="fixed-top w-100 h-100 bg-dark"
                        style={{
                            opacity: 0,
                            zIndex: 1040,
                            cursor: "pointer"
                        }}
                        initial={{opacity: 0}}
                        animate={{opacity: 0.5}} // Opacità al 50% stile backdrop di Bootstrap
                        exit={{opacity: 0}}
                        onClick={onClose}
                    />

                    {/* BOTTOM SHEET */}
                    <motion.div
                        className="fixed-bottom bg-white rounded-top-4 p-4 shadow-lg mx-auto"
                        style={{
                            zIndex: 1050,
                            maxHeight: "85vh",
                            overflowY: "auto",
                            // Opzionale: limita la larghezza sui grandi schermi per non farla sformare
                            maxWidth: "500px",
                            borderTopLeftRadius: "1.5rem",
                            borderTopRightRadius: "1.5rem"
                        }}
                        initial={{y: "100%"}}
                        animate={{y: 0}}
                        exit={{y: "100%"}}
                        transition={{type: "spring", damping: 25, stiffness: 200}}
                    >
                        {/* Maniglia superiore per il look "mobile" */}
                        <div
                            className="bg-secondary bg-opacity-25 rounded-pill mx-auto mb-3"
                            style={{width: "50px", height: "5px"}}
                        />

                        {/* Contenuto interno */}
                        <div className="container-fluid p-0">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}