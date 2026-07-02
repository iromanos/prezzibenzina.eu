'use client'
import React from "react";
import useMobile from "@/hooks/useMobile";
import useInteraction from "@/hooks/useInteraction";

export function AdsDesktop({children, className, height = 96}) {

    const {active} = useInteraction();

    const {isMobile} = useMobile();

    return <div className={className + ' d-none d-lg-flex'}
                style={{
                    height: `${height}px`
                }}>
        {active === false &&
            <div
                className={'d-flex bg-secondary-subtle justify-content-center align-items-center h-100 w-100'}
            ><span>PUBBLICITA'</span></div>
        }

        {active && isMobile === false && children}
    </div>;

}