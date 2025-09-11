import SearchForm from '@/components/SearchForm';
import Header from "@/components/Header";

export const metadata = {
    title: 'Trova Distributori Carburante | PrezziBenzina.eu',
    description: 'Cerca impianti di carburante vicino a te. Filtra per tipo di carburante, inserisci un indirizzo o usa la tua posizione per trovare i prezzi migliori.',
    keywords: ['prezzi benzina', 'distributori carburante', 'diesel', 'gpl', 'metano', 'elettrico', 'mappa impianti'],
    openGraph: {
        title: 'Trova Distributori Carburante | PrezziBenzina.eu',
        description: 'Filtra per tipo di carburante e trova gli impianti più vicini con i prezzi aggiornati.',
        url: 'https://www.prezzibenzina.eu/ricerca',
        images: ['/assets/logo-og.png']
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Trova Distributori Carburante | PrezziBenzina.eu',
        description: 'Filtra per tipo di carburante e trova gli impianti più vicini con i prezzi aggiornati.',
        images: ['/assets/logo-twitter.png']
    }
};

export default function Ricerca() {
    return (
        <>
            <Header />

            {/* HERO */}
            <section className=" bg-primary bg-gradient text-white py-5 text-center">
                <div className="container">
                    <h1 className="display-5 fw-bold mb-3">Trova il distributore più conveniente</h1>
                    <p className="lead mb-4">Filtra per carburante, inserisci la tua posizione e risparmia subito.</p>
                    <a href="#form" className="btn btn-light btn-lg px-4 py-2 shadow-sm">🔎 Inizia la ricerca</a>
                </div>
            </section>


            <div className={"container"}>

            {/* FORM */}
            <div id='form' className="bg-white rounded-4 shadow p-4 border my-4">
                <SearchForm />
            </div>


            <section className="mt-5">
                <h2 className="h4">Trova distributori di carburante vicino a te</h2>
                <p>
                    Con <strong>PrezziBenzina.eu</strong> puoi cercare in modo semplice e veloce i distributori di carburante più convenienti nella tua zona. Grazie alla nostra piattaforma aggiornata quotidianamente, hai accesso a informazioni affidabili su prezzi di <em>benzina, diesel, GPL, metano ed elettrico</em>.
                </p>
                <p>
                    Inserisci un indirizzo, una città o usa la tua posizione per visualizzare sulla mappa gli impianti più vicini. Puoi filtrare per tipo di carburante, distanza e marchio, così da trovare esattamente ciò che ti serve. Il nostro sistema è ottimizzato per smartphone e tablet, ideale anche per chi è in viaggio.
                </p>
                <p>
                    Ogni giorno migliaia di automobilisti usano <strong>PrezziBenzina.eu</strong> per <strong>risparmiare sul pieno</strong> e scegliere con consapevolezza dove fare rifornimento. Inizia la tua ricerca ora e scopri quanto puoi risparmiare.
                </p>
            </section>
            </div>

            {/* CTA AGGRESSIVA */}
            <section className="bg-danger text-white py-5 text-center">
                <div className="container">
                    <h2 className="fw-bold display-6 mb-3">Stai ancora pagando troppo per il carburante?</h2>
                    <p className="lead mb-4">Ogni minuto che aspetti, potresti spendere di più. Trova subito il distributore migliore.</p>
                    <a href="/risultati" className="btn btn-light btn-lg px-5 py-3 shadow-sm">🚀 Cerca ora</a>
                </div>
            </section>

            {/* VANTAGGI */}
            <section className="bg-light py-5">
                <div className="container text-center">
                    <h2 className="mb-4">Perché usare PrezziBenzina.eu?</h2>
                    <div className="row">
                        {[
                            'Risparmi tempo e denaro',
                            'Eviti sorprese alla pompa',
                            'Scopri impianti serviti e self',
                            'Ottimizzato per smartphone'
                        ].map((v, i) => (
                            <div key={i} className="col-md-3 mb-3">
                                <div className="p-3 border rounded bg-white shadow-sm h-100">{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
