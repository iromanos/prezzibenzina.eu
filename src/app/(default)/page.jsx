import SearchIcon from "@mui/icons-material/Search";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Footer from "@/components/Footer";
import MapSection from "@/components/home/MapSection";

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
                    <h1 className="display-3 fw-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Risparmia ogni giorno sul carburante.
                    </h1>
                    <p className="lead mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Prezzi aggiornati. Mappa interattiva. Distributori in Italia e Svizzera 🇮🇹🇨🇭
                    </p>
                    <a href="/ricerca" className="btn btn-light btn-lg px-4 py-2 shadow-sm">
                        <SearchIcon /> Inizia la ricerca
                    </a>
                </div>
            </div>

            {/* COME FUNZIONA */}
            <div className="container py-5">
                <h2 className="text-center mb-5 fw-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Come funziona</h2>
                <div className="row text-center">
                    {[
                        { icon: '⛽', title: 'Scegli il carburante', text: 'Filtra per benzina, diesel, GPL, metano o elettrico.' },
                        { icon: '📍', title: 'Inserisci la posizione', text: 'Digita un indirizzo o usa la tua geolocalizzazione.' },
                        { icon: '💰', title: 'Confronta e risparmia', text: 'Visualizza i prezzi e scegli il distributore migliore.' },
                    ].map((step, i) => (
                        <div className="col-md-4 mb-4" key={i}>
                            <div className="p-4 border rounded shadow-sm h-100 bg-light hover-shadow">
                                <div className="mb-2 fs-1">{step.icon}</div>
                                <h5 className="fw-bold">{step.title}</h5>
                                <p>{step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DESCRIZIONE */}
            <section className="bg-light py-5">
                <div className="container">
                    <h2 className="h4 mb-3 fw-bold">PrezziBenzina.eu: il tuo alleato per risparmiare</h2>
                    <p>
                        <strong>PrezziBenzina.eu</strong> ti aiuta a trovare i distributori più convenienti nella tua zona. Grazie alla mappa interattiva e ai filtri intelligenti, puoi cercare impianti per <em>benzina, diesel, GPL, metano ed elettrico</em> in base alla posizione, al marchio e alla distanza.
                    </p>
                    <p>
                        Il sistema è aggiornato costantemente per offrirti dati affidabili ogni giorno. Che tu sia in viaggio o nella tua città, puoi accedere rapidamente alle informazioni sui prezzi e scegliere dove fare rifornimento in modo consapevole.
                    </p>
                    <p>
                        Ottimizzato per smartphone e tablet, PrezziBenzina.eu ti fa risparmiare tempo, denaro e ti evita brutte sorprese alla pompa.
                    </p>
                </div>
            </section>

            {/* PERCHÉ USARLO */}
            <div className="container pb-5">
                <h2 className="text-center mb-4 fw-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Perché usarlo</h2>
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <ul className="list-group list-group-flush fs-5">
                            <li className="list-group-item bg-transparent">✅ Risparmi tempo e denaro</li>
                            <li className="list-group-item bg-transparent">✅ Eviti sorprese alla pompa</li>
                            <li className="list-group-item bg-transparent">✅ Scopri impianti serviti e self-service</li>
                            <li className="list-group-item bg-transparent">✅ Funziona su smartphone, tablet e desktop</li>
                        </ul>
                    </div>
                </div>
            </div>

            <section className="container-fluid bg-light py-5">
                <div className="container">
                    <h2 className="text-center fw-bold mb-4">Mappa interattiva: Italia e Svizzera in un colpo d’occhio</h2>
                    <div

                        style={{
                            height: '100vh'
                        }}

                        className="col border rounded overflow-hidden">
                        <MapSection />
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <button className="btn btn-outline-primary">Solo Italia</button>
                        <button className="btn btn-outline-danger">Solo Svizzera</button>
                        <button className="btn btn-outline-dark">Tutti</button>
                    </div>
                </div>
            </section>


            {/* CTA FINALE */}
            <div className="container text-center py-5 bg-danger text-white rounded mb-4">
                <h2 className="fw-bold display-6 mb-3">
                    Stai ancora pagando troppo per il carburante?
                </h2>
                <p className="lead mb-4">
                    Scopri subito dove fare il pieno al prezzo più basso. Ogni minuto che aspetti, potresti spendere di più.
                </p>
                <a href="/ricerca" className="btn btn-light btn-lg px-5 py-3 shadow-sm">
                    <RocketLaunchIcon /> Trova il distributore più conveniente ADESSO
                </a>
            </div>

        </>
    );
}
