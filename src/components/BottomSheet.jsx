"use client";

import {animate, AnimatePresence, useDragControls, useMotionValue} from "motion/react";
import {motion} from "framer-motion";
import {useEffect, useRef, useState} from "react";

export function BottomSheetSimple({
                                      isOpen = true,
                                      onExpanded,
                                      onIsMobile,
                                      children,
                                      minHeight = 110,
                                      expanded = false
                                  }) {
    const [isMounted, setIsMounted] = useState(false);
    const [windowHeight, setWindowHeight] = useState(800);
    const [isMobile, setIsMobile] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const y = useMotionValue(800);
    const [overflowY, setOverflowY] = useState("hidden");
    const dragControls = useDragControls();

    const contentRef = useRef(null);

    const [isScrollTop, setIsScrollTop] = useState(true);

    useEffect(() => {
        console.log(expanded);
        let point = snapPoints[0];
        if (expanded) {
            point = snapPoints[1];
        }
        animate(y, point, {
            type: "spring",
            damping: 30,
            stiffness: 250,
        });

        setIsExpanded(expanded);
    }, [expanded]);

    useEffect(() => {
        if (isExpanded) {
            setOverflowY("auto");
        } else {
            setOverflowY("hidden");
            if (contentRef.current !== null) {
                contentRef.current.scrollTop = 0;
            }
        }
        onExpanded?.(isExpanded);
    }, [isExpanded]);

    useEffect(() => {
        setIsMounted(true);

        const handleResize = () => {
            if (typeof window !== "undefined") {
                console.log(window.innerWidth);
                setWindowHeight(window.innerHeight);
                const mobile = window.innerWidth <= 768;
                setIsMobile(mobile);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const snapPoints = [
        windowHeight - minHeight,   // Snap 0: 110px visibili dal fondo (Solo Mobile)
        windowHeight * 0.10   // Snap 1: 80% dell'altezza (Solo Mobile)
    ];

    // Gestione dell'altezza e della posizione iniziale in base al dispositivo
    useEffect(() => {
        if (isOpen && isMounted) {
            if (isMobile) {
                y.set(windowHeight - minHeight);
                setIsExpanded(false);
            } else {
                y.set(0); // Su desktop la blocchiamo a inizio schermo (top: 0)
                setOverflowY("auto"); // Su desktop sempre scrollabile
            }
        }
        onIsMobile?.(isMobile);
    }, [isOpen, windowHeight, isMounted, isMobile, y]);

    const handleDragEnd = (event, info) => {
        if (!isMobile) return;

        const currentY = y.get();
        const heightFromBottom = windowHeight - currentY;

        // Calcoliamo di quanto si è spostata FISICAMENTE la scheda dall'alto verso il basso
        const deltaYFromTop = currentY - snapPoints[1];

        let targetSnap;

        // CORREZIONE: Invece di info.offset.y, controlliamo se la scheda è scesa di 110px rispetto allo snap in alto
        if (isExpanded && deltaYFromTop >= 64) {
            targetSnap = snapPoints[0]; // Torna a 110px
            setIsExpanded(false);
        }
        // CONDIZIONE 2: Se era in basso e l'altezza da terra supera i 220px, si apre del tutto
        else if (!isExpanded && heightFromBottom >= minHeight * 2) {
            targetSnap = snapPoints[1];
            setIsExpanded(true);
        }
        // Rimbalzo standard se rilasciata a metà senza superare le soglie
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
    const startYRef = useRef(0);

    if (!isMounted) return null;

    // STILI RESPONSIVE DETERMINANTI
    const desktopStyles = {
        x: 0,
        left: "auto",
        right: "0",                     // Attaccata al bordo destro dello schermo
        height: "100vh",
        // Tutto schermo verticale (Altezza totale)
        width: "440px",
        maxWidth: "440px",              // Larghezza fissa richiesta a 400px
        borderTopLeftRadius: "0",       // Rimuoviamo i bordi arrotondati per un look sidebar pulito
        borderTopRightRadius: "0",
        borderLeft: "1px solid rgba(0,0,0,0.08)",
        borderTop: "none",
        scrollbarGutter: "stable",
    };

    const mobileStyles = {
        width: "100%",
        x: "-50%",
        left: "50%",
        right: "auto",
        height: `${windowHeight * 0.90}px`, // Su mobile mantiene il limite dell'80%
        borderTopLeftRadius: "1.5rem",
        borderTopRightRadius: "1.5rem",
        borderTop: "1px solid rgba(0,0,0,0.08)",
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag={isMobile ? "y" : false}
                    dragControls={dragControls}
                    dragListener={false}
                    dragConstraints={isMobile ? {top: snapPoints[1], bottom: snapPoints[0]} : undefined}
                    dragElastic={isMobile ? {top: 0.05, bottom: 0} : undefined}
                    onDragEnd={handleDragEnd}
                    style={{
                        y: y,
                        zIndex: 1050,
                        touchAction: isMobile ? "none" : "auto",
                        position: "fixed",
                        top: 0,
                        ...(isMobile ? mobileStyles : desktopStyles),
                        overscrollBehaviorY: "contain",
                    }}
                    className="bg-white shadow-lg "
                    exit={isMobile ? {y: windowHeight} : {x: "100%"}} // Su desktop esce lateralmente a destra
                    transition={{type: "spring", damping: 30, stiffness: 250}}
                >
                    {/* Maniglia di trascinamento: Visibile solo su Mobile */}
                    {isMobile ? (
                        <div className="py-3 w-100 d-flex justify-content-center"
                             onPointerDown={(e) => dragControls.start(e)}
                             style={{cursor: "grab"}}>
                            <div
                                className="bg-secondary bg-opacity-100 rounded-pill"
                                style={{width: "40px", height: "4px"}}
                            />
                        </div>
                    ) : (
                        // Spaziatore superiore estetico opzionale per Desktop al posto della maniglia
                        <div/>
                    )}

                    {/* Contenuto interno */}
                    <div
                        ref={contentRef}
                        style={{
                            height: isMobile ? "calc(100% - 36px)" : "calc(100%)",
                            overflowY: overflowY,
                            touchAction: isMobile ? (!isExpanded ? "none" : "auto") : "auto",
                            overscrollBehaviorY: "contain",
                        }}
                    >
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}