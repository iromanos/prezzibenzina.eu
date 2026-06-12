'use client'
import React from "react";
import useMobile from "@/hooks/useMobile";
import useInteraction from "@/hooks/useInteraction";

export function AdsDesktop({children, className}) {

    const {active} = useInteraction();

    const {isMobile} = useMobile();

    return <div className={className}>

        {active === false &&
            <div className={'bg-secondary-subtle d-none d-lg-flex justify-content-center align-items-center'}
                 style={{
                     height: '82px'
                 }}><span>PUBBLICITA'</span></div>
        }

        {active && isMobile === false && children}
    </div>;

}