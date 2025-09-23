import {usePosizioneAttuale} from '@/hooks/usePosizioneAttuale';
import {log} from "@/functions/helpers";

export default function PosizioneAttualeButton({onPosizione}) {
    const posizione = usePosizioneAttuale();

    const handleClick = () => {

        log(posizione);

        if (posizione) onPosizione(posizione);
    };

    return (
        <button
            className="btn btn-sm btn-primary position-absolute top-0 start-0 m-2 z-3"
            onClick={handleClick}
            disabled={!posizione}
        >
            📍 Posizione attuale
        </button>
    );
}
