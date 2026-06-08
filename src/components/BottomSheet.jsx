"use client";

import {animate, AnimatePresence, motion, useMotionValue} from "motion/react";
import {useEffect, useState} from "react";

export default function BottomSheet({isOpen = true, onClose, children}) {
    const [isMounted, setIsMounted] = useState(false);
    const [windowHeight, setWindowHeight] = useState(800);
    const [isExpanded, setIsExpanded] = useState(false);

    const [overflowY, setOverflowY] = useState("hidden");


    const minHeight = 90;

    const y = useMotionValue(800);

    useEffect(() => {
        if (isExpanded) {
            setOverflowY("auto");
        } else {
            setOverflowY("hidden");
        }
    }, [isExpanded]);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== "undefined") {
            setWindowHeight(window.innerHeight);
        }
    }, []);

    const snapPoints = [
        windowHeight - minHeight,   // Snap 0: Ridotta in basso (110px visibili)
        windowHeight * 0.20   // Snap 1: Espansa in alto (80% dello schermo)
    ];

    useEffect(() => {
        if (isOpen && isMounted) {
            y.set(windowHeight - minHeight);
            setIsExpanded(false);
        }
    }, [isOpen, windowHeight, isMounted, y]);

    const handleDragEnd = (event, info) => {
        if (!info || !info.offset) return;
        if (Math.abs(info.offset.y) < 2) return;

        const currentY = y.get();
        const heightFromBottom = windowHeight - currentY;

        let targetSnap;

        // CONDIZIONE 1: Se era tutta aperta e l'utente trascina verso il basso per 110px o più
        if (isExpanded && info.offset.y >= minHeight) {
            targetSnap = snapPoints[0]; // MODIFICATO: Torna a 110px invece di chiudersi
            setIsExpanded(false);
        }
        // CONDIZIONE 2: Se era in basso e supera i 220px totali da terra, si apre del tutto
        else if (!isExpanded && heightFromBottom >= 220) {
            targetSnap = snapPoints[1];
            setIsExpanded(true);
        }
        // Comportamento standard di rimbalzo se rilasciata a metà senza superare le soglie
        else {
            targetSnap = snapPoints.reduce((prev, curr) => {
                return Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev;
            });
            setIsExpanded(targetSnap === snapPoints[1]);
        }

        animate(y, targetSnap, {
            type: "spring",
            damping: 30,
            stiffness: 250,
        });
    };

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag="y"
                    // Vincoliamo il drag rigidamente tra l'80% e i 110px dal fondo
                    dragConstraints={{top: snapPoints[1], bottom: snapPoints[0]}}
                    dragElastic={{top: 0.05, bottom: 0}} // Muro duro in basso, non va oltre i 110px
                    onDragEnd={handleDragEnd}
                    style={{
                        y: y,
                        x: "-50%",
                        height: `${windowHeight * 0.80}px`,
                        zIndex: 1050,
                        maxWidth: "500px",
                        borderTopLeftRadius: "1.5rem",
                        borderTopRightRadius: "1.5rem",
                        touchAction: "none",
                        borderTop: "1px solid rgba(0,0,0,0.08)",
                        position: "fixed",
                        top: 0,
                        left: "50%",
                    }}
                    className="bg-white shadow-lg w-100"
                    exit={{y: windowHeight}}
                    transition={{type: "spring", damping: 30, stiffness: 250}}
                >
                    {/* Maniglia */}
                    <div className="py-3 w-100 d-flex justify-content-center" style={{cursor: "grab"}}>
                        <div
                            className="bg-secondary bg-opacity-25 rounded-pill"
                            style={{width: "40px", height: "5px"}}
                        />
                    </div>

                    {/* Contenuto */}
                    <div className="pb-3" style={{height: "calc(100% - 45px)", overflowY: overflowY}}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}