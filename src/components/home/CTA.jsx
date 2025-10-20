import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

export default function CTA() {
    return <div className="container mb-4">
        <div className={'col text-center p-5 bg-danger text-white rounded'}>
            <h2 className="fw-bold display-6 mb-3">
                Stai ancora pagando troppo per il carburante?
            </h2>
            <p className="lead mb-4">
                Scopri subito dove fare il pieno al prezzo più basso. Ogni minuto che aspetti, potresti spendere di più.
            </p>
            <a href="/ricerca" className="btn btn-light btn-lg px-5 py-3 shadow-sm">
                <RocketLaunchIcon/> Trova il distributore più conveniente ADESSO
            </a></div>
    </div>
}