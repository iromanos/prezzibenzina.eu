import MapIcon from "@mui/icons-material/Map";
import Link from "next/link";
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function FooterHome() {
    return <>
        <Link className={'btn btn-success'} href={'/mappa'}><MapIcon/> Mappa</Link>
        <Link href={'/preferiti'} className={'btn btn-light'}><FavoriteIcon className={'text-danger'}/> Preferiti</Link>
    </>
}