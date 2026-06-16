import MapIcon from "@mui/icons-material/Map";
import Link from "next/link";
import FavoriteIcon from '@mui/icons-material/Favorite';
import CookieBanner from "@/components/CookieBanner";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import React from "react";

export default function FooterHome() {
    return <>
        <Link className={'btn btn-success'} href={'/mappa'}><MapIcon/> Mappa</Link>
        <Link href={'/preferiti'} className={'btn btn-light'}><FavoriteIcon className={'text-danger'}/> Preferiti</Link>
        <CookieBanner forMobile={true}/>
    </>
}


export function FooterDistributori() {
    return <>
        <Link className={'btn btn-primary'} href={'#mappa'}><MapIcon/> Mappa</Link>
        <Link className={'btn btn-outline-primary'} href={'#distributori'}><FormatListBulletedIcon/></Link>
        <Link href={'/preferiti'} className={'btn btn-light'}><FavoriteIcon className={'text-danger'}/></Link>
        <CookieBanner forMobile={true}/>
    </>
}
