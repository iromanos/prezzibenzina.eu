import MappaWrapper from "@/components/MappaWrapper";


export default function Mappa() {

    const distributori = [];

    return (
        <div className="position-relative vh-100">
            <div className={"position-absolute top-0 start-0 w-100 h-100"}>
                <MappaWrapper distributori={distributori}/>
            </div>
            {/* Overlay filtri */}
            <div className="position-absolute top-0 end-0 p-2 z-3">
                <button className="btn btn-sm btn-light">Filtri</button>
            </div>

            {/* Lista distributori */}

            {distributori.length !== 0 ?

                <div className="position-absolute bottom-0 w-100 z-3">
                    <div className="bg-white shadow rounded-top p-3" style={{maxHeight: '40vh', overflowY: 'auto'}}>
                        {distributori.map((d, i) => (
                            <div key={i} className="mb-2">
                                <div className="fw-bold">{d.nome}</div>
                                <div className="text-muted small">{d.indirizzo}</div>
                                <div className="text-end text-muted">{d.prezzo} €/L</div>
                            </div>
                        ))}
                    </div>
                </div> : null}
        </div>
    );
}
