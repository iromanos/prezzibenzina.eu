/**
 * Genera un testo SEO dinamico e unico per le pagine dei distributori filtrati per servizio e comune.
 * Ottimizzato per evitare contenuti duplicati e fornire valore ai 200 capoluoghi e comuni principali.
 */
export function generateDistributorSeoText({service, comuneData, distributori, marchioId, currentFuel, marchi}) {
    const count = distributori?.length || 0;
    const selectedMarchio = marchi?.find(m => m.id.toString() === marchioId?.toString());
    const brandNames = [...new Set(distributori?.map(d => d.bandiera))].slice(0, 5);

    const serviceAction = (slug) => {
        switch (slug) {
            case 'autolavaggio':
                return "mantenere il veicolo pulito e protetto dagli agenti atmosferici";
            case 'area-ristoro':
                return "concederti una pausa caffè o uno spuntino veloce durante il tragitto";
            case 'metano':
            case 'gpl':
                return "effettuare il rifornimento di carburanti alternativi ecologici";
            case 'colonnina-ricarica-elettrica':
                return "ricaricare le batterie del tuo veicolo a zero emissioni";
            case 'bancomat':
                return "gestire pagamenti e prelievi in totale sicurezza h24";
            case 'scarico-per-camper':
                return "effettuare le operazioni di manutenzione igienica per il tuo caravan";
            default:
                return `usufruire del servizio specializzato di ${service.description}`;
        }
    };

    if (count === 0) {
        return [
            `Al momento non abbiamo individuato distributori attivi che offrano il servizio di **${service.description}** nel comune di ${comuneData.description} (${comuneData.provincia_id}).`,
            `Ti suggeriamo di consultare gli impianti nelle città limitrofe della provincia o di verificare se i distributori di ${currentFuel} nelle vicinanze dispongano di altri servizi accessori utili alla tua sosta.`,
            `La nostra community aggiorna costantemente i dati: se conosci un impianto a ${comuneData.description} che offre ${service.description}, segnalalo subito tramite l'apposita funzione di segnalazione.`
        ];
    }

    const p1 = `Cercare un distributore con **${service.description}** a **${comuneData.description}** è fondamentale per viaggiare senza stress. Il territorio di ${comuneData.description} (${comuneData.provincia_id}) offre una rete di rifornimento variegata che monitoriamo costantemente per te.`;

    const p1b = `Oltre all'erogazione di ${currentFuel}, le stazioni selezionate mettono a disposizione infrastrutture specifiche progettate per ${serviceAction(service.slug)}, garantendo una sosta efficiente e confortevole.`;

    const p2 = selectedMarchio
        ? `La tua preferenza per il marchio ${selectedMarchio.nome} trova riscontro a ${comuneData.description}, dove il brand è presente con impianti all'avanguardia. Scegliere un distributore che integra il servizio di **${service.description}** ti permette di gestire al meglio le necessità del tuo veicolo, monitorando i prezzi comunicati di recente.`
        : `A **${comuneData.description}**, la competizione tra i marchi va a vantaggio del tuo portafoglio. Con ${count} impianti censiti, troverai insegne come ${brandNames.join(', ')} e diverse "pompe bianche" che offrono il servizio richiesto come valore aggiunto alla tua sosta.`;

    const p3 = `La nostra community segnala i prezzi di ${currentFuel} e la qualità dei servizi in tempo reale. Conoscere in anticipo la presenza di un'area dedicata a **${service.description}** ti evita inutili giri a vuoto durante i tuoi spostamenti.`;

    const p3b = `Ogni record include indirizzo esatto e navigazione GPS integrata, eliminando ogni margine di errore mentre sei alla guida a ${comuneData.description}.`;

    const p4 = `In conclusione, se vuoi risparmiare sul pieno di ${currentFuel} o hai bisogno di ${serviceAction(service.slug)}, questa guida ai servizi di **${comuneData.description}** è il tuo strumento definitivo.`;

    return [p1, p1b, p2, p3, p3b, p4];
}