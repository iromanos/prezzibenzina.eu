import {SERVIZI_ICON_COMPONENTS} from "@/constants";

export default function ElencoServizi({serviziInEvidenza}) {
    return <div className="container my-5">
        <div className="text-center mb-4">
            <h3 className="fw-bold text-uppercase h5">Servizi per il tuo viaggio</h3>
            <p className="text-muted">Trova distributori attrezzati nelle principali città</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
            {serviziInEvidenza.map((servizio, i) => {
                const IconComponent = SERVIZI_ICON_COMPONENTS[servizio.icona];
                return <a href={`/distributori/${servizio.slug}/vicino-a-me`} key={i}
                          className={'btn btn-sm rounded-pill px-4 border bg-white'}>
                    {IconComponent && <IconComponent className={'me-2'}/>}{servizio.description}
                </a>;
            })}
            <div className="col-12 text-center mt-3">
                <a href="/ricerca" className="btn btn-outline-primary btn-sm rounded-pill px-4">Scopri tutti i
                    servizi</a>
            </div>
        </div>
    </div>

}