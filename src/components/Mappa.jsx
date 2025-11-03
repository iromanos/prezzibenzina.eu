'use client'

import MappaWrapper from "@/components/MappaWrapper";
import React, {useEffect, useRef, useState} from "react";
import {log} from "@/functions/helpers";
import MapIcon from "@mui/icons-material/Map";

import Button from 'react-bootstrap/Button';

export default function Mappa({distributori, title = true, height = '75vh'}) {

    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const [state, setState] = useState();

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
        <div ref={containerRef} className={'border rounded position-relative mb-4'} style={{
            height: height
        }}>
            {isVisible ? <><MappaWrapper
                onMapLoad={(center, zoom) => {
                    setState({
                        center: center, zoom: zoom
                    })
                }}
                distributori={distributori}/>
            </> : <></>}</div>
        <Button onClick={event => {
            if (state) {
                const uri = `lat=${state.center.lat}&lng=${state.center.lng}&zoom=${state.zoom}`;
                window.location.href = `/mappa?${uri}`;
            }
        }} variant={'success'}><MapIcon/> Mostra tutti gli impianti</Button>
    </section>;
}