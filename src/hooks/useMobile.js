'use client'

import {useEffect, useState} from "react";


export default function useMobile() {
    const [isMobile, setIsMobile] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width <= 768;
            setIsMobile(mobile);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Aggiunto onWidthChange alle dipendenze


    return {isMobile};

}

export function useLaptop() {
    const [isLaptop, setIsLaptop] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width > 768 && width <= 1024;
            setIsLaptop(mobile);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Aggiunto onWidthChange alle dipendenze


    return {isLaptop};

}