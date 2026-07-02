'use client'
import MapIcon from "@mui/icons-material/Map";
import Link from "next/link";
import FavoriteIcon from '@mui/icons-material/Favorite';
import CookieBanner from "@/components/CookieBanner";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import React, {useState} from "react";
import Button from "react-bootstrap/Button";

export default function FooterHome() {
    return <>
        <Link className={'btn btn-success'} href={'/mappa'}><MapIcon/> Mappa</Link>
        <Link href={'/preferiti'} className={'btn btn-light'}><FavoriteIcon className={'text-danger'}/> Preferiti</Link>
        <CookieBanner forMobile={true}/>
    </>
}


export function FooterDistributori() {

    const [resetKey, setResetKey] = useState(0);

    const handleScroll = (e, id) => {
        e.currentTarget.blur()
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({behavior: 'smooth', block: 'start'});

            setTimeout(() => {
                setResetKey(prev => prev + 1);
            }, 100);
        }
    };


    return <div key={resetKey} className={'d-flex align-items-center gap-2'}>
        <Button
            variant={'primary'}
            onClick={(e) => handleScroll(e, 'mappa')}
        ><MapIcon/> Mappa</Button>
        <Button

            variant={'outline-primary'}
            onClick={(e) => handleScroll(e, 'distributori')}
        ><FormatListBulletedIcon/></Button>


        <Link href={'/preferiti'} className={'btn btn-light'}><FavoriteIcon className={'text-danger'}/></Link>
        <CookieBanner forMobile={true}/>
    </div>
}
