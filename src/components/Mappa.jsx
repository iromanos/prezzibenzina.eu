'use client'

import MappaWrapper from "@/components/MappaWrapper";
import React, {useEffect, useRef, useState} from "react";
import {log} from "@/functions/helpers";


export default function Mappa({distributori, title = true, height = '50vh'}) {

    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    log("LOAD MAP")
                    setIsVisible(true);
                    observer.disconnect(); // disattiva dopo il primo trigger
                }
            },
            {
                root: null,
                rootMargin: '0px 0px 180px 0px',
                threshold: 0.1,
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);


    return <section className={"mb-4"}>
        {title ? <h2 className="h5 mb-3">Mappa dei distributori</h2> : null}
        <div ref={containerRef} className={'border rounded'} style={{
            height: height
        }}>
            {isVisible ? <MappaWrapper distributori={distributori}/> : <></>}</div>
    </section>;
}