import {usePosizioneAttuale} from '@/hooks/usePosizioneAttuale';
import {log} from "@/functions/helpers";
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import Link from "react-bootstrap/NavLink"
import Image from 'next/image';

export default function PosizioneAttualeButton({onPosizione, footerHeight = 0, rightWidth = 0}) {
    const posizione = usePosizioneAttuale();

    const handleClick = () => {

        log(posizione);

        if (posizione) onPosizione(posizione);
    };

    return (
        <button
            type={'button'}
            style={{
                bottom: footerHeight,
                width: 56,
                height: 56
            }}
            className="btn btn-light shadow-sm
                    border border-dark-subtle
                    d-flex align-items-center justify-content-center
                    rounded-circle
                    position-absolute m-3 z-3 start-0
                    "
            onClick={handleClick}
            disabled={!posizione}><LocationSearchingIcon/></button>

            /*
            <Link title={'Home'} href={'/'}><Image className={'rounded'} width={90} height={90}
                                                   src={'/assets/logo-180.png'} alt={'PrezzoBenzina.eu'}/></Link> */

    );
}
