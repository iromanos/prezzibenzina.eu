import {usePosizioneAttuale} from '@/hooks/usePosizioneAttuale';
import {log} from "@/functions/helpers";
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';

export default function PosizioneAttualeButton({onPosizione, footerHeight = 0}) {
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
            className="btn btn-light shadow-sm z-3 m-3
                    border border-dark-subtle
                    d-flex align-items-center justify-content-center
                    rounded-circle position-absolute"
            onClick={handleClick}
            disabled={!posizione}><LocationSearchingIcon/></button>
    );
}
