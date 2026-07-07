'use client';

import React, {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {BsGeoAlt, BsGeoFill} from "react-icons/bs";
import ShareButton from "../ShareButton";
import {FiAlertTriangle} from "react-icons/fi";

export default function DistributoriList({distributori, URI_IMAGE}) {
    const ITEMS_PER_PAGE = 5;
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Helper per formattare la data (spostata qui perché logica UI)
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Helper per Google Maps
    const getMapsUrl = (lat, lon) => `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    const visibleDistributori = distributori.slice(0, visibleCount);
    const hasMore = visibleCount < distributori.length;

    const loadMore = () => {
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, distributori.length));
    };

    // Sincronizzazione con la mappa: se la mappa tenta di scrollare a un elemento non ancora visibile
    useEffect(() => {
        const handleMapScroll = (e) => {
            const id = e.detail?.id;
            const index = distributori.findIndex(d => d.id_impianto === id);
            if (index !== -1 && index >= visibleCount) {
                setVisibleCount(index + 1);
            }
        };

        window.addEventListener('pb-scroll-to-impianto', handleMapScroll);
        return () => window.removeEventListener('pb-scroll-to-impianto', handleMapScroll);
    }, [distributori, visibleCount]);

    return (
        <div className="row g-3">
            {visibleDistributori.map((distributore) => (
                <div key={distributore.id_impianto} id={`impianto-${distributore.id_impianto}`} className="col-12">
                    <div className="card shadow-sm p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                {distributore.image ? (
                                    <Image
                                        unoptimized
                                        className="mb-2 object-fit-contain"
                                        style={{height: '40px', width: 'auto'}}
                                        src={URI_IMAGE + distributore.image}
                                        alt={distributore.bandiera} width={48} height={48}/>
                                ) : (
                                    <h2 className="h5 fw-bold mb-1">{distributore.bandiera}</h2>
                                )}
                                <p className="small fw-bold text-dark mb-1">{distributore.nome_impianto}</p>
                                <p className="text-muted mb-2">{distributore.indirizzo} - {distributore.comune}</p>

                                <div className="mb-2">
                                    <span
                                        className="badge bg-primary-subtle text-primary border border-primary-subtle me-1"
                                        style={{fontSize: '0.7rem'}}>
                                        <BsGeoAlt className="me-1"/>{distributore.tipo_impianto}
                                    </span>
                                    {distributore.gestore && (
                                        <span className="text-muted small"
                                              style={{fontSize: '0.75rem'}}>Gestore: {distributore.gestore}</span>
                                    )}
                                </div>

                                {distributore.impianto_servizi?.services?.length > 0 && (
                                    <div className="d-flex flex-wrap gap-1">
                                        {distributore.impianto_servizi.services.map((s) => (
                                            <span key={s.id}
                                                  className="badge rounded-pill bg-light text-secondary border fw-normal"
                                                  style={{fontSize: '10px'}} title={s.description}>
                                                {s.description}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="text-end">
                                <div className="mb-2">
                                    <span className="h3 fw-bold text-success d-block mb-0">{distributore.prezzo}€</span>
                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                        {distributore.fuels?.[0]?.is_self === 1 ? 'Self' : 'Servito'}
                                    </span>
                                    <p className="small text-muted mb-0">{distributore.fuels?.[0]?.desc_carburante || 'Benzina'}</p>
                                </div>
                                {distributore.fuels?.[0]?.dtcomu && (
                                    <p className="text-muted" style={{fontSize: '0.7rem'}}>
                                        Aggiornato il:<br/>{formatDate(distributore.fuels[0].dtcomu)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <hr className="my-3 opacity-25"/>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div className="btn-group">
                                <a href={getMapsUrl(distributore.latitudine, distributore.longitudine)} target="_blank"
                                   rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                    <BsGeoFill className="me-1"/>Naviga
                                </a>
                                <Link href={`/impianto/${distributore.link}`}
                                      className="btn btn-outline-primary btn-sm">
                                    Dettagli
                                </Link>
                            </div>
                            <div className="d-flex">
                                <Link href={`/impianto/${distributore.link}/segnala`}
                                      className="btn btn-sm btn-light text-decoration-none text-muted"
                                      title="Segnala errore">
                                    <FiAlertTriangle className={'fs-5'}/>
                                </Link>
                                <ShareButton
                                    impianto={distributore}
                                    title={distributore.nome_impianto || distributore.bandiera}
                                    path={`/impianto/${distributore.link}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {hasMore && (
                <div className="col-12 text-center mt-4">
                    <button onClick={loadMore} className="btn btn-outline-primary rounded-pill px-5 py-2">
                        Mostra altri distributori
                        <small className="d-block text-muted" style={{fontSize: '0.7rem'}}>
                            Visualizzati {visibleCount} di {distributori.length}
                        </small>
                    </button>
                </div>
            )}
        </div>
    );
}