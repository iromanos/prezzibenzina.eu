'use client';

import React from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {BsCreditCard, BsCupHot, BsDroplet, BsPCircle, BsPersonWheelchair, BsTools, BsWater} from 'react-icons/bs';
import {FaBaby, FaCarSide, FaChargingStation, FaWifi} from 'react-icons/fa6';

// Mappatura delle classi CSS provenienti dall'API ai componenti react-icons
const ICON_COMPONENTS = {
    'bi bi-cup-hot': BsCupHot,
    'bi bi-tools': BsTools,
    'bi bi-p-circle': BsPCircle,
    'bi bi-water': BsWater,
    'fa-solid fa-baby': FaBaby,
    'bi bi-credit-card': BsCreditCard,
    'bi-person-wheelchair': BsPersonWheelchair,
    'fa-solid fa-wifi': FaWifi,
    'fa-solid fa-car-side': FaCarSide,
    'bi bi-droplet': BsDroplet,
    'fa-solid fa-charging-station': FaChargingStation,
};

export default function FilterBar({servizi, marchi, carburanti, currentServiceSlug, currentComuneSlug, URI_IMAGE}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleServiceChange = (slug) => {
        router.push(`/distributori/${slug}/${currentComuneSlug}`);
    };

    const handleMarchioSelect = (id) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set('marchio', id.toString());
        } else {
            params.delete('marchio');
        }
        router.push(`?${params.toString()}`);
    };

    const handleFuelChange = (fuel) => {
        const params = new URLSearchParams(searchParams.toString());
        if (fuel) {
            params.set('fuel', fuel);
        } else {
            params.delete('fuel');
        }
        router.push(`?${params.toString()}`);
    };

    const currentFuel = searchParams.get('fuel') || 'benzina';

    // Ordiniamo i servizi in ordine alfabetico per descrizione
    const sortedServizi = servizi
        ? [...servizi].sort((a, b) => a.description.localeCompare(b.description))
        : [];

    // Ordiniamo i marchi in ordine alfabetico per nome
    const sortedMarchi = marchi
        ? [...marchi].sort((a, b) => a.nome.localeCompare(b.nome))
        : [];

    return (
        <div className="mb-4">
            {/* Filtro Carburante: Segmented Control */}
            <div className="d-flex justify-content-center mb-3">
                <div className="btn-group bg-white shadow-sm p-1 rounded-pill" role="group">
                    {carburanti?.map(c => (
                        <button
                            key={c.id}
                            type="button"
                            className={`btn pb-filter-chip rounded-pill px-3 py-1 border-0 ${currentFuel === c.tipo ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => handleFuelChange(c.tipo)}
                            style={{fontSize: '0.85rem'}}
                        >
                            {c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="row g-3">
                {/* Filtro Servizi: Chips avvolgenti con icone */}
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2 d-block">Servizio
                        ricercato</label>
                    <div className="d-flex flex-wrap gap-2">
                        {sortedServizi.map(s => {
                            const IconComponent = ICON_COMPONENTS[s.icona];
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => handleServiceChange(s.slug)}
                                    className={`btn pb-filter-chip btn-sm rounded-pill d-flex align-items-center border ${currentServiceSlug === s.slug ? 'btn-primary border-primary shadow-sm' : 'btn-white bg-white text-secondary'}`}
                                >
                                    {IconComponent && <IconComponent className="me-2"/>}
                                    {s.description}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filtro Marchi: Chips avvolgenti */}
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2 d-block">Marchio</label>
                    <div className="d-flex flex-wrap gap-2">
                        <button
                            onClick={() => handleMarchioSelect('')}
                            className={`btn pb-filter-chip btn-sm rounded-pill border ${!searchParams.get('marchio') ? 'btn-primary border-primary shadow-sm' : 'btn-white bg-white text-secondary'}`}
                        >
                            Tutti i marchi
                        </button>
                        {sortedMarchi.map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleMarchioSelect(m.id)}
                                className={`btn pb-filter-chip btn-sm rounded-pill d-flex align-items-center border ${searchParams.get('marchio') === m.id.toString() ? 'btn-primary border-primary shadow-sm' : 'btn-white bg-white text-secondary'}`}
                            >
                                {m.logo && (
                                    <img
                                        src={`${URI_IMAGE}${m.logo}`}
                                        alt={m.nome}
                                        className="me-2"
                                        style={{height: '18px', width: 'auto', objectFit: 'contain'}}
                                    />
                                )}
                                <span className="text-nowrap">{m.nome}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pb-filter-chip {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out !important;
                }

                .pb-filter-chip:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }

                .pb-filter-chip:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}