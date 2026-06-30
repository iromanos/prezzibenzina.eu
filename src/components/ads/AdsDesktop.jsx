'use client'
import React from "react";
import useMobile from "@/hooks/useMobile";
import useInteraction from "@/hooks/useInteraction";

export function AdsDesktop({children, className, height = 96}) {

    const {active} = useInteraction();

    // const [active, setActive] = useState(false);

    const {isMobile} = useMobile();

    return <div className={className}
                style={{
                    height: `${height}px`
                }}>

        {active === false &&
            <div
                onClick={() => {
                    // setActive(true);
                }}
                className={'bg-secondary-subtle d-none d-lg-flex justify-content-center align-items-center h-100'}
            ><span>PUBBLICITA'</span></div>
        }

        {active && isMobile === false && children}
    </div>;

}