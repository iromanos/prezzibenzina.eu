'use client'

import useMobile from "../hooks/useMobile";
import MapIcon from "@mui/icons-material/Map";
import Link from "next/link";


export function FooterMobile({children}) {


    const {isMobile} = useMobile();

    console.log("IS MOBILE", isMobile);

    if (isMobile !== true) return;


    return <footer className={'container py-3 fixed-bottom rounded-top-4 bg-white z-top shadow-lg border'}>
        <div className={'d-flex align-items-center gap-2'}>
            {children === undefined && <Link className={'btn btn-success'} href={'/mappa'}><MapIcon/> Mappa</Link>}
            {children}
        </div>
    </footer>;
}