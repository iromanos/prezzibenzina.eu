export const metadata = {
    title: 'PrezziBenzina.eu | Risparmia sul Carburante',
    description: 'Trova i distributori più convenienti vicino a te. PrezziBenzina.eu ti guida con mappa interattiva e filtri intelligenti.',
};

export default function Home() {
    return (
        <>
            {/* HERO */}
            <div className="container-fluid bg-primary bg-gradient text-white min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center px-4">
                    <img src="/assets/logo-transparent.png" alt="Logo PrezziBenzina.eu" className="mb-4" style={{ maxWidth: '320px' }} />
                    <h1 className="display-4 fw-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Fai il pieno, spendi meno.
                    </h1>
                    <p className="lead mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Trova i distributori più convenienti nella tua zona. Ogni giorno.
                    </p>
                    <a href="/ricerca" className="btn btn-light btn-lg shadow-sm">🔍 Inizia la ricerca</a>
                </div>
            </div>

            {/* COME FUNZIONA */}
            <div className="container py-5">
                <h2 className="text-center mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Come funziona</h2>
                <div className="row text-center">
                    <div className="col-md-4 mb-4">
                        <div className="interactive-box p-3 border rounded shadow-sm h-100 bg-light">
                            <div className="mb-2 fs-1">⛽</div>
                            <h5 className="fw-bold">Scegli il carburante</h5>
                            <p>Filtra per benzina, diesel, GPL, metano o elettrico.</p>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="interactive-box p-3 border rounded shadow-sm h-100 bg-light">
                            <div className="mb-2 fs-1">📍</div>
                            <h5 className="fw-bold">Inserisci la posizione</h5>
                            <p>Digita un indirizzo o usa la tua geolocalizzazione.</p>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="interactive-box p-3 border rounded shadow-sm h-100 bg-light">
                            <div className="mb-2 fs-1">💰</div>
                            <h5 className="fw-bold">Confronta e risparmia</h5>
                            <p>Visualizza i prezzi e scegli il distributore migliore.</p>
                        </div>
                    </div>
                </div>
            </div>

            <section className="bg-light py-5">
                <div className="container">
                    <h2 className="h4 mb-3">PrezziBenzina.eu: il tuo alleato per risparmiare sul carburante</h2>
                    <p>
                        <strong>PrezziBenzina.eu</strong> è la piattaforma pensata per aiutarti a trovare i distributori di carburante più convenienti nella tua zona. Grazie alla nostra mappa interattiva e ai filtri intelligenti, puoi cercare impianti per <em>benzina, diesel, GPL, metano ed elettrico</em> in base alla posizione, al marchio e alla distanza.
                    </p>
                    <p>
                        Il sistema è aggiornato costantemente per offrirti dati affidabili e utili ogni giorno. Che tu sia in viaggio o nella tua città, puoi accedere rapidamente alle informazioni sui prezzi del carburante e scegliere dove fare rifornimento in modo consapevole.
                    </p>
                    <p>
                        La piattaforma è ottimizzata per smartphone e tablet, così puoi usarla ovunque ti trovi. Con <strong>PrezziBenzina.eu</strong> risparmi tempo, denaro e eviti brutte sorprese alla pompa. Inizia la tua ricerca ora e scopri quanto puoi risparmiare.
                    </p>
                </div>
            </section>


            {/* PERCHÉ USARLO */}
            <div className="container pb-5">
                <h2 className="text-center mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Perché usarlo</h2>
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item bg-transparent">✅ Risparmi tempo e denaro</li>
                            <li className="list-group-item bg-transparent">✅ Eviti sorprese alla pompa</li>
                            <li className="list-group-item bg-transparent">✅ Scopri impianti serviti e non</li>
                            <li className="list-group-item bg-transparent">✅ Ottimizzato per smartphone e tablet</li>
                        </ul>
                    </div>
                </div>
            </div>


            <div className="container text-center py-5">
                <h2 className="fw-bold display-6">
                    Stai ancora pagando troppo per il carburante?
                </h2>
                <p className="lead mb-4">
                    Scopri subito dove fare il pieno al prezzo più basso. Ogni minuto che aspetti, potresti spendere di più.
                </p>
                <a href="/ricerca" className="btn btn-danger btn-lg px-5 py-3 shadow-sm">
                    🚀 Trova il distributore più conveniente ADESSO
                </a>
            </div>



        </>
    );
}
