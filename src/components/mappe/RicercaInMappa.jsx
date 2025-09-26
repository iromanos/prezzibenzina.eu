import NominatimAutocomplete from "@/components/NominatimAutocomplete";
import {log} from "@/functions/helpers";


export default function RicercaInMappa() {

    return <div className="position-absolute top-0 start-0 m-3 z-3 bg-white"
                style={{width: '90%', maxWidth: '400px'}}>
        <NominatimAutocomplete
            onSelect={(place) => {
                log('Selezionato:' + place);
            }}
        />
    </div>
}