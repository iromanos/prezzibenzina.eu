'use client';

import React from 'react';
import {BsGeoFill, BsInfoCircle, BsListUl, BsMap, BsSliders} from 'react-icons/bs';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {AdsDesktop} from "../ads/AdsDesktop";
import Display6977770298 from "@/components/ads/Display-6977770298.jsx";
import Display5745053645 from "@/components/ads/Display-5745053645.jsx";

/**
 * Manager unico del layout della pagina distributori.
 * Gestisce Header, Filtri, Lista e Mappa in modo integrato.
 */
export default function MobileViewManager({
                                              header,
                                              filterBar,
                                              title,
                                              count,
                                              comuneName,
                                              listComponent,
                                              mapComponent,
                                              seoParagraphs,
                                              serviceDescription,
                                              distributori,
                                              URI_IMAGE,
                                              notifyButton // Nuova prop
                                          }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Leggiamo la vista direttamente dall'URL (default 'list')
    const view = searchParams.get('view') || 'list';

    // Su mobile, se siamo in vista mappa, non mostriamo Header e Filtri per dare full-screen
    const isMapActive = view === 'map';

    const toggleView = (newView) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newView);
        router.push(`?${params.toString()}`, {scroll: false});
    };

    return (
        <div className={`pb-layout-manager ${isMapActive ? 'pb-map-mode' : ''}`}>

            {/* Header e Titolo: visibili solo se la mappa non è attiva a schermo intero su mobile */}
            <div className={`pb-header-sticky-wrapper ${isMapActive ? 'd-none d-md-block' : 'sticky-top bg-white'}`}
                 style={{top: 0, zIndex: 1030}}>
                {header}
                {!isMapActive && (
                    <div className="container-fluid mt-3 pb-2 border-bottom">
                        <div className='container'>
                            <h1 className="h4 fw-bold mb-1">{title}</h1>
                            <p className="small text-muted mb-0">
                                Trovati <strong>{count}</strong> distributori a {comuneName}.
                            </p>
                            {notifyButton} {/* Renderizza il pulsante di notifica qui */}
                        </div>
                    </div>
                )}
            </div>

            {/* Filtri: Renderizzati fuori dalla sezione header per permettere all'Offcanvas di funzionare sempre */}
            <div className={`container ${!isMapActive ? 'mt-3' : ''}`}>
                {filterBar}
            </div>

            {/* Pubblicità Top: Visibile solo se la mappa non è attiva a schermo intero su mobile */}
            {!isMapActive && (
                <div className="container mt-2 mb-4">
                    <Display6977770298/>
                </div>
            )}

            <main className="container pb-5">
                <div className="row">
                    {/* Colonna Lista */}
                    <div className={`col-md-5 order-2 order-md-1 ${isMapActive ? 'd-none d-md-block' : 'd-block'}`}>
                        {listComponent}
                    </div>

                    {/* Colonna Mappa */}
                    <div
                        className={`col-md-7 order-1 order-md-2 mb-4 mb-md-0 ${!isMapActive ? 'd-none d-md-block' : 'd-block'}`}>
                        <div className="pb-map-container sticky-top" style={{top: 'calc(160px + 1rem)'}}>
                            {mapComponent}

                            {/* Pubblicità Sidebar Desktop sotto la mappa */}
                            {!isMapActive && (
                                <div className="mt-4 d-none d-lg-block">
                                    <AdsDesktop>
                                        <Display5745053645/>
                                    </AdsDesktop>
                                </div>
                            )}
                        </div>

                        {/* Carosello Orizzontale Distributori - Solo su Mobile in modalità Mappa */}
                        {isMapActive && distributori && (
                            <div className="pb-map-carousel d-md-none position-fixed w-100"
                                 style={{bottom: '72px', zIndex: 1060}}>
                                <div className="d-flex flex-nowrap overflow-x-auto gap-3 px-3 py-4"
                                     style={{scrollSnapType: 'x mandatory', scrollbarWidth: 'none'}}>
                                    {distributori.slice(0, 15).map((d, index) => (
                                        <div
                                            key={`carousel-${d.id_impianto}-${index}`}
                                            className="bg-white rounded-4 shadow p-3 flex-shrink-0"
                                            style={{
                                                width: '280px',
                                                scrollSnapAlign: 'center',
                                                border: '1px solid #eee'
                                            }}
                                            onClick={() => {
                                                // Trigger per centrare la mappa (se implementato nel MapComponent)
                                                window.dispatchEvent(new CustomEvent('pb-scroll-to-impianto', {detail: {id: d.id_impianto}}));
                                            }}
                                        >
                                            <div className="d-flex align-items-center mb-2">
                                                {d.image && (
                                                    <img src={`${URI_IMAGE}${d.image}`} alt="" className="me-2"
                                                         style={{height: '24px', width: 'auto', objectFit: 'contain'}}/>
                                                )}
                                                <span className="fw-bold small text-truncate">{d.bandiera}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <p className="small text-muted mb-0 text-truncate"
                                                       style={{maxWidth: '160px'}}>{d.indirizzo}</p>
                                                    <span
                                                        className="badge bg-success-subtle text-success small border border-success-subtle">
                                                        {d.fuels?.[0]?.is_self === 1 ? 'Self' : 'Servito'}
                                                    </span>
                                                </div>
                                                <div className="text-end">
                                                    <span
                                                        className="h5 fw-bold text-success mb-0 d-block">{d.prezzo}€</span>
                                                    <small className="text-muted"
                                                           style={{fontSize: '0.7rem'}}>{d.fuels?.[0]?.desc_carburante}</small>
                                                </div>
                                            </div>

                                            {/* Pulsanti CTA */}
                                            <div className="d-flex gap-2 mt-3">
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${d.latitudine},${d.longitudine}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary btn-sm flex-grow-1 fw-bold"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <BsGeoFill className="me-1"/> Naviga
                                                </a>
                                                <Link
                                                    href={`/impianto/${d.link}`}
                                                    className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Dettagli
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sezione Pubblicità e SEO a tutta larghezza (Full Width) */}
                {!isMapActive && (
                    <div className="row mt-5">
                        <div className="col-12">
                            {/* Pubblicità In-Feed */}
                            <div className="mb-5 text-center">
                                <Display5745053645/>
                            </div>

                            {/* Testo SEO Approfondito */}
                            <section
                                className="p-4 p-md-5 bg-white border-start border-4 border-primary rounded shadow-sm lh-lg"
                                style={{color: '#4a4a4a', backgroundColor: '#fafafa'}}>
                                <h2 className="h4 fw-bold text-dark mb-4 d-flex align-items-center">
                                    <BsInfoCircle className="me-3 text-primary"/>
                                    Tutto quello che devi sapere su {title}
                                </h2>
                                {seoParagraphs.map((text, idx) => (
                                    <p key={idx}
                                       className={`${idx === 0 ? "lead fw-normal mb-4 text-secondary" : "mb-3"}`}>
                                        {text.split('**').map((part, i) => i % 2 === 1 ? (
                                            <strong key={i}>{part}</strong>
                                        ) : (
                                            <React.Fragment key={i}>{part}</React.Fragment>
                                        ))}
                                    </p>
                                ))}
                            </section>
                        </div>
                    </div>
                )}
            </main>

            {/* Tasto switch mobile */}
            <div className="d-md-none fixed-bottom mb-4 d-flex justify-content-center gap-2" style={{zIndex: 1070}}>
                {/* Tasto Filtri: appare solo quando la mappa è attiva su mobile */}
                {isMapActive && (
                    <button
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('pb-open-filters'));
                        }}
                        className="btn btn-light rounded-pill shadow-lg px-4 py-2 fw-bold border d-flex align-items-center"
                    >
                        <BsSliders className="me-2"/>
                        Filtri
                    </button>
                )}

                <button onClick={() => toggleView(isMapActive ? 'list' : 'map')}
                        className="btn btn-dark rounded-pill shadow-lg px-4 py-2 fw-bold">
                    {view === 'list' ? (
                        <><BsMap className="me-2"/> Visualizza Mappa</>
                    ) : (
                        <><BsListUl className="me-2"/> Lista</>
                    )}
                </button>
            </div>

            <style jsx>{`
                .pb-map-container {
                    //height: 560px;
                }

                @media (max-width: 767px) {
                    .pb-map-mode {
                        overflow: hidden;
                        height: 100vh;
                    }

                    /* Nasconde l'interfaccia inline dei filtri in modalità mappa, ma mantiene l'Offcanvas */
                    .pb-map-mode .pb-filter-bar > div:not(.offcanvas):not(.offcanvas-backdrop) {
                        display: none !important;
                    }

                    .pb-map-container {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: 100vh !important;
                        width: 100vw !important;
                        z-index: 1000 !important; /* Abbassato per sicurezza rispetto ai filtri */
                        background: white;
                    }

                    .pb-map-carousel::-webkit-scrollbar {
                        display: none;
                    }
                }

                .pb-map-container {
                    transition: all 0.3s ease;
                }
            `}</style>
        </div>
    );
}