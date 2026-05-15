import {usePosizioneAttuale} from '@/hooks/usePosizioneAttuale';
import {log} from "@/functions/helpers";
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';

export default function PosizioneAttualeButton({onPosizione}) {
    const posizione = usePosizioneAttuale();

    const handleClick = () => {

        log(posizione);

        if (posizione) onPosizione(posizione);
    };

    return (
        <button
            type={'button'}
            style={{
                width: 56,
                height: 56
            }}
            className="btn btn-primary shadow-sm
                    d-flex align-items-center justify-content-center
                    rounded-circle
                    "
            onClick={handleClick}
            disabled={!posizione}><LocationSearchingIcon/></button>
    );
}
