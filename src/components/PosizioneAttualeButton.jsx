import {usePosizioneAttuale} from '@/hooks/usePosizioneAttuale';
import {logDebug} from "@/functions/helpers";
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import Button from "react-bootstrap/Button";
import DirectionsIcon from '@mui/icons-material/Directions';

export default function PosizioneAttualeButton({onPosizione}) {
    const posizione = usePosizioneAttuale();

    const handleClick = () => {

        logDebug(posizione);

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

export function IndicazioniButton({onClick}) {
    return <Button
        onClick={onClick}
        variant={'light'}
        className={'shadow-sm align-items-center justify-content-center rounded-circle text-primary border-dark-subtle'}
        style={{
            width: 56, height: 56
        }}
    >
        <DirectionsIcon/>

    </Button>;
}