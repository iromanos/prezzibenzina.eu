import {notFound} from 'next/navigation';
import {getComuneBySlug, getServiceBySlug} from "../../../../../functions/data";
import Header from "../../../../../components/Header";
import {getDistributoriRegione, getElencoCarburanti, getMarchi, getServizi} from "../../../../../functions/api";
import React from "react";
import MapComponent from "../../../../../components/distributori/MapComponent";
import DistributoriList from "../../../../../components/distributori/DistributoriList";
import FilterBar from "../../../../../components/distributori/FilterBar";
import {generateDistributorSeoText} from "../../../../../functions/seo";
import {BsInfoCircle} from "react-icons/bs";

/**
 * Genera i metadati SEO dinamici per la pagina.
 * @returns {Promise<import('next').Metadata>}
 */
export async function generateMetadata({params}) {
    const {servizio, comune} = await params;

    const [service, comuneData] = await Promise.all([
        getServiceBySlug(servizio),
        getComuneBySlug(comune)
    ]);

    if (!service || !comuneData) {
        notFound();
    }

    return {
        title: `Distributori con ${service.description} a ${comuneData.description}`,
        description: `Elenco e mappa dei distributori con ${service.description} a ${comuneData.description}. Orari, prezzi e servizi aggiornati.`,
    };
}

/**
 * Il componente React che renderizza la pagina.
 */
export default async function PaginaDistributoreServizioComune({params, searchParams}) {

    const URI_IMAGE = process.env.NEXT_PUBLIC_IMAGE_ENDPOINT;

    const {servizio: servizioSlug, comune: comuneSlug} = await params;
    const {marchio: marchioId, fuel: fuelParam} = await searchParams;

    const currentFuel = fuelParam || 'benzina';

    const [service, comuneData] = await Promise.all([
        getServiceBySlug(servizioSlug),
        getComuneBySlug(comuneSlug)
    ]);

    // Recuperiamo l'elenco completo di servizi, marchi e carburanti per i filtri
    const [servizi, marchi, elencoCarburanti] = await Promise.all([
        getServizi(),
        getMarchi(),
        getElencoCarburanti()
    ]);

    if (!service || !comuneData) {
        notFound();
    }

    // Recuperiamo i distributori filtrati per comune e servizio.
    const distributori = await getDistributoriRegione(null, currentFuel, marchioId, null, comuneData.id, service.id, 50);

    // Generiamo il testo SEO unico e approfondito (200+ parole)
    const seoParagraphs = generateDistributorSeoText({
        service,
        comuneData,
        distributori,
        marchioId,
        currentFuel,
        marchi
    });

    return (
        <><Header/>
            <main className="container py-5">
                <h1 className="h2 fw-bold mb-2">
                    Distributori con {service.description} a {comuneData.description}
            </h1>
                <p className="lead text-muted mb-4">
                    Abbiamo trovato <strong>{distributori?.length || 0}</strong> distributori che offrono questo
                    servizio a {comuneData.description}.
            </p>

                <FilterBar
                    servizi={servizi}
                    marchi={marchi}
                    URI_IMAGE={URI_IMAGE}
                    carburanti={elencoCarburanti}
                    currentServiceSlug={servizioSlug}
                    currentComuneSlug={comuneSlug}
                />

                <div className="row">
                    <div className="col-lg-5 order-2 order-lg-1">
                        {distributori && distributori.length > 0 ? (
                            <DistributoriList distributori={distributori} URI_IMAGE={URI_IMAGE}/>
                        ) : (
                            <div className="col-12">
                                <div className="p-5 border rounded bg-light text-center">
                                    <p className="text-muted mb-0">Nessun distributore trovato con questo servizio in
                                        questa zona.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Colonna Mappa */}
                    <div className="col-lg-7 order-1 order-lg-2 mb-4 mb-lg-0">
                        <div className="sticky-top" style={{top: 'calc(80px + 1rem)', zIndex: 10}}>
                            <MapComponent distributori={distributori} comuneData={comuneData}/>
                        </div>
                    </div>
                </div>

                {/* Testo SEO Approfondito - Posizionato Full Width a fondo pagina per miglior leggibilità */}
                <div className="row mt-5">
                    <div className="col-12">
                        <section
                            className="p-4 p-md-5 bg-white border-start border-4 border-primary rounded shadow-sm lh-lg"
                            style={{color: '#4a4a4a'}}>
                            <h2 className="h3 fw-bold text-dark mb-4 d-flex align-items-center">
                                <BsInfoCircle className="me-3 text-primary"/>
                                Tutto quello che devi sapere su {service.description} a {comuneData.description}
                            </h2>
                            {seoParagraphs.map((text, idx) => (
                                <p key={idx} className={`${idx === 0 ? "lead fw-normal text-dark mb-4" : "mb-3"}`}>
                                    {text.split('**').map((part, i) => i % 2 === 1 ?
                                        <strong key={i}>{part}</strong> : part)}
                                </p>
                            ))}
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
