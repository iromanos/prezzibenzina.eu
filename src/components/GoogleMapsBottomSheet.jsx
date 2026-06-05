'use client'

import React, {useEffect, useRef, useState} from 'react';
import {motion, useAnimation, useMotionValue} from 'framer-motion';

export const GoogleMapsBottomSheet = ({children, header, onResize}) => {
    const controls = useAnimation();
    const y = useMotionValue(0);
    const contentRef = useRef(null);
    const touchStartRef = useRef(0);
    // Stati per la gestione mobile
    const [snapPoints, setSnapPoints] = useState([112, 700]);
    const [startingPoint, setStartingPoint] = useState(snapPoints[0]);

    // Stato per capire se siamo su desktop (larghezza >= 992px, breakpoint 'lg' di Bootstrap)
    const [isDesktop, setIsDesktop] = useState(false);

    const [isScrollEnabled, setIsScrollEnabled] = useState(false);

    const desktopWidth = 400;


    useEffect(() => {

        const handleFocus = e => {
            if (isDesktop) return;
            console.log('map:focus');
            controls.start({
                y: 0,
                transition: {type: 'spring', stiffness: 300, damping: 30}
            });
        };

        window.addEventListener('map:focus', handleFocus);
        return () => window.removeEventListener('map:focus', handleFocus);

    }, [])


    useEffect(() => {
        const handleResize = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (vw >= 992) {
                setIsDesktop(true);
                setIsScrollEnabled(true);
                controls.set({y: 0});
                onResize?.(desktopWidth, 0);
            } else {
                setIsDesktop(false);
                setIsScrollEnabled(false);

                // Calcolo altezze mobile
                const chiuso = snapPoints[0];
                const meta = Math.floor(vh * 0.45);
                const massimo = Math.floor(vh * 0.92);

                setSnapPoints([chiuso, massimo]);
                setStartingPoint(chiuso);

                controls.start({
                    y: 0,
                    transition: {type: 'spring', stiffness: 300, damping: 30}
                });
                onResize?.(0, snapPoints[0]);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [controls]);

    // 🔄 Intercettiamo i movimenti in tempo reale per sbloccare/bloccare lo scroll
    useEffect(() => {
        if (isDesktop) return;

        return y.on("change", (latestY) => {
            const puntoMassimoY = startingPoint - snapPoints[1]; // Valore Y (negativo) quando è tutto aperto

            // Se il foglio è arrivato in cima (o quasi, tolleranza di 5px), abilita lo scroll
            if (latestY <= puntoMassimoY + 5) {
                setIsScrollEnabled(true);
            } else {
                setIsScrollEnabled(false);
                if (contentRef.current) contentRef.current.scrollTop = 0;
            }
        });
    }, [y, startingPoint, snapPoints, isDesktop]);

    // 🔑 INTERCETTAZIONE DELLO SCROLL VERSO IL BASSO (MOBILE)
    const handleTouchStart = (e) => {
        if (isDesktop) return;
        // Registriamo la coordinata Y iniziale del dito
        touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        if (isDesktop || !contentRef.current) return;

        const scrollTop = contentRef.current.scrollTop;
        const currentTouchY = e.touches[0].clientY;
        // Se la differenza è positiva, l'utente sta muovendo il dito verso il basso (Pull Down)
        const isPullingDown = currentTouchY > touchStartRef.current;

        // Se siamo a inizio pagina (scrollTop === 0) e l'utente tira verso il basso
        if (scrollTop <= 0 && isPullingDown) {
            // Disabilitiamo lo scroll nativo del div per cedere il controllo a Framer Motion
            setIsScrollEnabled(false);
        }
    };

    const handleDragEnd = (event, info) => {
        if (isDesktop) return;

        if (isScrollEnabled && contentRef.current && contentRef.current.scrollTop > 0) {
            return;
        }

        const currentY = y.get();
        const velocityY = info.velocity.y;
        const predictedDistance = currentY + velocityY * 0.2;

        const closestPoint = snapPoints.reduce((prev, curr) => {
            const prevTarget = startingPoint - prev;
            const currTarget = startingPoint - curr;

            return Math.abs(predictedDistance - currTarget) < Math.abs(predictedDistance - prevTarget)
                ? curr
                : prev;
        });

        const targetY = startingPoint - closestPoint;

        if (targetY > (startingPoint - snapPoints[0]) + 50 && onClose) {
            onClose();
        } else {
            controls.start({
                y: targetY,
                transition: {type: 'spring', stiffness: 300, damping: 28}
            }).then(() => {
                const puntoMassimoY = startingPoint - snapPoints[1];
                if (y.get() <= puntoMassimoY + 5) {
                    setIsScrollEnabled(true);
                }
            });
        }
    };

    // Stili condizionali: uniamo Bootstrap al CSS dinamico basato sul dispositivo
    const desktopStyle = {
        top: 0,
        right: 0,
        width: `${desktopWidth}px`,
        height: '100vh',
        zIndex: 1050,
    };

    const mobileStyle = {
        y,
        height: `${snapPoints[1]}px`,
        bottom: `-${snapPoints[1] - startingPoint}px`,
        zIndex: 1050,
        borderTopLeftRadius: '1.5rem',
        borderTopRightRadius: '1.5rem'
    };

    return (
        <motion.div

            // Se lo scroll interno è bloccato (perché siamo a scrollTop 0 e tiriamo giù), il drag della sheet si attiva
            drag={isDesktop ? false : (isScrollEnabled && contentRef.current?.scrollTop > 0 ? false : "y")}

            dragConstraints={isDesktop ? false : {
                top: startingPoint - snapPoints[1],
                bottom: startingPoint - snapPoints[0],
            }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{y: 0}}
            // Classi Bootstrap condizionali: in mobile si allarga al 100%, in desktop si ancora a destra con bordo laterale
            className={`position-absolute bg-white shadow-lg border-start user-select-none ${
                isDesktop ? 'end-0 top-0 h-100 border-start' : 'start-0 end-0 border-top'
            }`}
            style={isDesktop ? desktopStyle : mobileStyle}
        >

            {/* Barra di trascinamento: visibile SOLO su mobile */}
            {!isDesktop && (
                <div className="w-100 d-flex justify-content-center py-3" style={{cursor: 'grab'}}>
                    <div className="rounded-pill" style={{width: '50px', height: '6px', backgroundColor: '#dee2e6'}}/>
                </div>
            )}

            {/* Titolo o Header fisso opzionale per il Desktop */}
            {header}
            {/* Area del Contenuto */}
            <div
                ref={contentRef}

                // onTouchStart={handleTouchStart} // <-- Intercetta inizio tocco
                // onTouchMove={handleTouchMove}   // <-- Intercetta direzione movimento
                className={`pb-5 ${isDesktop ? 'h-100' : ''}`}
                style={
                    {
                        overflowY: isScrollEnabled ? 'auto' : 'hidden',
                        touchAction: isScrollEnabled ? 'pan-y' : 'none',
                        maxHeight: isDesktop ? 'calc(100vh)' : '100%'
                    }
                }
            >
                {children}
            </div>
        </motion.div>
    );
};


export const GoogleMapsBottomSheetVER2 = ({children, isOpen = true, onClose}) => {
    const controls = useAnimation();
    const y = useMotionValue(0);
    const contentRef = useRef(null);

    const [snapPoints, setSnapPoints] = useState([80, 350, 700]);
    const [startingPoint, setStartingPoint] = useState(350);
    const [isDesktop, setIsDesktop] = useState(false);

    // Coordinate per tracciare il movimento manuale del dito
    const touchStart = useRef(0);
    const currentYOffset = useRef(0);
    const isTrackingTouch = useRef(false);

    useEffect(() => {
        const handleResize = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            if (vw >= 992) {
                setIsDesktop(true);
                controls.set({y: 0});
            } else {
                setIsDesktop(false);
                const chiuso = 90;
                const meta = Math.floor(vh * 0.45);
                const massimo = Math.floor(vh * 0.90);
                setSnapPoints([chiuso, meta, massimo]);
                setStartingPoint(meta);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [controls]);

    useEffect(() => {
        if (isOpen) {
            animateToPoint(snapPoints[1]); // Va a metà schermo all'apertura
        } else {
            animateToPoint(0); // Si chiude sotto lo schermo
        }
    }, [isOpen, snapPoints]);

    const animateToPoint = (pointInPixels) => {
        const targetY = startingPoint - pointInPixels;
        currentYOffset.current = targetY;
        y.set(targetY);
        controls.start({
            y: targetY,
            transition: {type: 'spring', stiffness: 350, damping: 30}
        });
    };

    // 🔑 GESTIONE DEL TOCCO NATIVA (Nessun conflitto con Framer Motion)
    const onTouchStart = (e) => {
        if (isDesktop) return;
        touchStart.current = e.touches[0].clientY;
        isTrackingTouch.current = false;
    };

    const onTouchMove = (e) => {
        if (isDesktop || !contentRef.current) return;

        const clientY = e.touches[0].clientY;
        const deltaY = clientY - touchStart.current; // Quantità di pixel spostati dal dito
        const scrollTop = contentRef.current.scrollTop;

        // CONDIZIONE GOOGLE MAPS: Se siamo in cima al testo e l'utente trascina VERSO IL BASSO (deltaY > 0)
        // Oppure se l'attivazione del movimento del pannello è già iniziata
        if ((scrollTop <= 0 && deltaY > 0) || isTrackingTouch.current) {
            isTrackingTouch.current = true; // Prende il controllo del movimento

            if (e.cancelable) e.preventDefault(); // Blocca lo scroll del browser/iOS

            // Muove il pannello in tempo reale seguendo il dito
            const newY = currentYOffset.current + deltaY;
            y.set(newY);
        }
    };

    const onTouchEnd = (e) => {
        if (!isTrackingTouch.current || isDesktop) return;
        isTrackingTouch.current = false;

        // Calcola lo snap point più vicino a dove l'utente ha lasciato il dito
        const currentY = y.get();

        const closestPoint = snapPoints.reduce((prev, curr) => {
            const prevTarget = startingPoint - prev;
            const currTarget = startingPoint - curr;
            return Math.abs(currentY - currTarget) < Math.abs(currentY - prevTarget) ? curr : prev;
        });

        // Se viene trascinato sotto il punto più basso, invoca la chiusura
        if (currentY > (startingPoint - snapPoints[0]) + 60 && onClose) {
            onClose();
        } else {
            animateToPoint(closestPoint);
        }
    };

    const desktopStyle = {top: 0, right: 0, width: '400px', height: '100vh', zIndex: 1050};
    const mobileStyle = {
        y,
        height: `${snapPoints[2]}px`,
        bottom: `-${snapPoints[2] - startingPoint}px`,
        zIndex: 1050,
        borderTopLeftRadius: '1.5rem',
        borderTopRightRadius: '1.5rem',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))'
    };

    if (!isOpen && !isDesktop) return null;

    return (
        <motion.div
            animate={controls}
            initial={isDesktop ? {x: 450} : {y: startingPoint}}
            className={`position-absolute bg-white shadow-lg ${
                isDesktop ? 'end-0 top-0 h-100 border-start' : 'start-0 end-0 border-top'
            }`}
            style={isDesktop ? desktopStyle : mobileStyle}
        >

            {/* AREA DI ASCOLTO TOUCH GLOBALE (Sia handle che contenuto rispondono allo stesso modo) */}
            <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{height: '100%', display: 'flex', flexDirection: 'column'}}
            >
                {/* Handle superiore */}
                {!isDesktop && (
                    <div className="w-100 d-flex justify-content-center py-3" style={{cursor: 'grab', flexShrink: 0}}>
                        <div className="rounded-pill"
                             style={{width: '50px', height: '6px', backgroundColor: '#dee2e6'}}/>
                    </div>
                )}

                {/* Header Desktop */}
                {isDesktop && (
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="m-0 fw-bold text-secondary">Dettagli</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                )}

                {/* Contenuto Scrollabile */}
                <div
                    ref={contentRef}
                    className="px-4 pb-5"
                    style={{
                        overflowY: 'auto',
                        flexGrow: 1,
                        maxHeight: isDesktop ? 'calc(100vh - 75px)' : '100%',
                        WebkitOverflowScrolling: 'touch', // Forza l'accelerazione hardware su iOS
                    }}
                >
                    {children}
                </div>
            </div>
        </motion.div>
    );
};