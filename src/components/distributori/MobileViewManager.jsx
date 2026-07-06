'use client';

import React from 'react';
import {BsGeoFill, BsInfoCircle, BsListUl, BsMap, BsSliders} from 'react-icons/bs';
import {useRouter, useSearchParams} from 'next/navigation';
import Link from 'next/link';

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
                                              URI_IMAGE
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

            {/* Header e Filtri: Nascosti su mobile solo in modalità mappa */}
            <div className={`pb-header-section ${isMapActive ? 'd-none d-md-block' : 'd-block'}`}>
                {header}
                <div className="container mt-4">
                    <h1 className="h2 fw-bold mb-2">{title}</h1>
                    <p className="lead text-muted mb-4">
                        Abbiamo trovato <strong>{count}</strong> distributori a {comuneName}.
                    </p>
                </div>
            </div>

            {/* Filtri: Renderizzati fuori dalla sezione header per permettere all'Offcanvas di funzionare sempre */}
            <div className="container">
                {filterBar}
            </div>

            <main className="container pb-5">
                <div className="row">
                    {/* Colonna Lista */}
                    <div className={`col-md-5 order-2 order-md-1 ${isMapActive ? 'd-none d-md-block' : 'd-block'}`}>
                        {listComponent}

                        {/* Testo SEO: solo sotto la lista */}
                        <section
                            className="mt-5 p-4 bg-white border-start border-4 border-primary rounded shadow-sm lh-lg d-none d-md-block"
                            style={{color: '#4a4a4a'}}>
                            <h2 className="h4 fw-bold text-dark mb-4 d-flex align-items-center">
                                <BsInfoCircle className="me-3 text-primary"/>
                                Tutto quello che devi sapere
                            </h2>
                            {seoParagraphs.map((text, idx) => (
                                <p key={idx} className={`${idx === 0 ? "lead fw-normal text-dark mb-4" : "mb-3"}`}>
                                    {text.split('**').map((part, i) => i % 2 === 1 ?
                                        <strong key={i}>{part}</strong> : part)}
                                </p>
                            ))}
                        </section>
                    </div>

                    {/* Colonna Mappa */}
                    <div
                        className={`col-md-7 order-1 order-md-2 mb-4 mb-md-0 ${!isMapActive ? 'd-none d-md-block' : 'd-block'}`}>
                        <div className="pb-map-container sticky-top" style={{top: 'calc(80px + 1rem)'}}>
                            {mapComponent}
                        </div>

                        {/* Carosello Orizzontale Distributori - Solo su Mobile in modalità Mappa */}
                        {isMapActive && distributori && (
                            <div className="pb-map-carousel d-md-none position-fixed w-100"
                                 style={{bottom: '72px', zIndex: 1060}}>
                                <div className="d-flex flex-nowrap overflow-x-auto gap-3 px-3 py-4"
                                     style={{scrollSnapType: 'x mandatory', scrollbarWidth: 'none'}}>
                                    {distributori.slice(0, 15).map((d) => (
                                        <div
                                            key={d.id_impianto}
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