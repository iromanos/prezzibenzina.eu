'use client'

import React, {useEffect, useRef, useState} from 'react';
import {motion, useAnimation, useMotionValue} from 'framer-motion';

export const GoogleMapsBottomSheet = ({children, header, onResize}) => {
    const controls = useAnimation();
    const y = useMotionValue(0);
    const containerRef = useRef(null);

    // Stati per la gestione mobile
    const [snapPoints, setSnapPoints] = useState([112, 350, 700]);
    const [startingPoint, setStartingPoint] = useState(snapPoints[0]);

    // Stato per capire se siamo su desktop (larghezza >= 992px, breakpoint 'lg' di Bootstrap)
    const [isDesktop, setIsDesktop] = useState(false);

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
                controls.set({y: 0});
                onResize?.(desktopWidth, 0);
            } else {
                setIsDesktop(false);

                // Calcolo altezze mobile
                const chiuso = snapPoints[0];
                const meta = Math.floor(vh * 0.45);
                const massimo = Math.floor(vh * 0.92);

                setSnapPoints([chiuso, meta, massimo]);
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

    const handleDragEnd = (event, info) => {
        // Se siamo su desktop, ignoriamo il calcolo del drag
        if (isDesktop) return;

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

        controls.start({
            y: targetY,
            transition: {type: 'spring', stiffness: 300, damping: 28}
        });
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
        height: `${snapPoints[2]}px`,
        bottom: `-${snapPoints[2] - startingPoint}px`,
        zIndex: 1050,
        borderTopLeftRadius: '1.5rem',
        borderTopRightRadius: '1.5rem'
    };

    return (
        <motion.div
            // Il drag è attivo SOLO se NON siamo su desktop
            drag={isDesktop ? false : "y"}
            dragConstraints={isDesktop ? false : {
                top: startingPoint - snapPoints[2],
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
                className={`pb-5 overflow-auto ${isDesktop ? 'h-100' : ''}`}
                style={{touchAction: isDesktop ? 'auto' : 'pan-y', maxHeight: isDesktop ? 'calc(100vh)' : '100%'}}
            >
                {children}
            </div>
        </motion.div>
    );
};