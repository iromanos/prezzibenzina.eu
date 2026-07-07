'use client';
import React, {useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {BsCreditCard, BsCupHot, BsDroplet, BsPCircle, BsPersonWheelchair, BsTools, BsWater} from 'react-icons/bs';
import {FaBaby, FaCarSide, FaChargingStation, FaWifi} from 'react-icons/fa6';
import {ucwords} from "@/functions/helpers";

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

    const [showShield, setShowShield] = useState(false);
    const currentFuel = searchParams.get('fuel') || 'benzina';
    const currentMarchio = searchParams.get('marchio') || '';

    useEffect(() => {
        const handleOpen = () => setShowShield(true);
        window.addEventListener('pb-open-filters', handleOpen);
        return () => window.removeEventListener('pb-open-filters', handleOpen);
    }, []);

    // Funzione helper per gestire la navigazione e chiudere il menu mobile
    const navigate = (url, isQuery = true) => {
        if (isQuery) {
            router.push(url);
        } else {
            router.push(url);
        }
        setShowShield(false);
    };

    const onServiceSelect = (slug) => {
        const params = searchParams.toString();
        const url = `/distributori/${slug}/${currentComuneSlug}${params ? `?${params}` : ''}`;
        router.push(url);
        setShowShield(false);
    };

    const onMarchioSelect = (id) => {
        const params = new URLSearchParams(searchParams.toString());
        id ? params.set('marchio', id.toString()) : params.delete('marchio');
        navigate(`?${params.toString()}`);
    };

    const onFuelSelect = (fuel) => {
        const params = new URLSearchParams(searchParams.toString());
        fuel ? params.set('fuel', fuel) : params.delete('fuel');
        navigate(`?${params.toString()}`);
    };

    const sortedServizi = useMemo(() =>
            servizi ? [...servizi].sort((a, b) => a.description.localeCompare(b.description)) : [],
        [servizi]);

    const sortedMarchi = useMemo(() =>
            marchi ? [...marchi].sort((a, b) => a.nome.localeCompare(b.nome)) : [],
        [marchi]);

    // --- Sotto-componenti di rendering per evitare ripetizioni ---

    const renderFuelSelector = (isFullWidth = false) => (
        <div className={`d-flex flex-wrap gap-2`}>
            {carburanti?.map(c => {
                // const IconComponent = c.icon;
                return (
                    <button
                        key={c.id}
                        type="button"
                        className={`btn pb-filter-chip btn-sm rounded-pill d-flex align-items-center border ${currentFuel === c.tipo ? 'btn-primary border-primary shadow-sm' : 'btn-white bg-white text-secondary'}`}

                        onClick={() => onFuelSelect(c.tipo)}
                        style={{fontSize: '0.85rem'}}
                    >
                        <span className={'me-2'}>{c.icon}</span>
                        {ucwords(c.tipo)}
                    </button>
                );
            })}
        </div>
    );

    const renderServiceChips = () => (
        <div className="d-flex flex-wrap gap-2">
            {sortedServizi.map(s => {
                const IconComponent = ICON_COMPONENTS[s.icona];
                const isActive = currentServiceSlug === s.slug;
                return (
                    <button
                        key={s.id}
                        onClick={() => onServiceSelect(s.slug)}
                        className={`btn pb-filter-chip btn-sm rounded-pill d-flex align-items-center border ${isActive ? 'btn-primary border-primary shadow-sm' : 'btn-white bg-white text-secondary'}`}
                    >
                        {IconComponent && <IconComponent className="me-2"/>}
                        {s.description}
                    </button>
                );
            })}
        </div>
    );

    const renderMarchioChips = () => (
        <div className="d-flex flex-wrap gap-2">
            <button
                onClick={() => onMarchioSelect('')}
                className={`btn pb-filter-chip btn-sm rounded-pill border ${!currentMarchio ? 'btn-primary border-primary shadow-sm' : 'btn-white bg-white text-secondary'}`}
            >
                Tutti i marchi
            </button>
            {sortedMarchi.map(m => {
                const isActive = currentMarchio === m.id.toString();
                return (
                    <button
                        key={m.id}
                        onClick={() => onMarchioSelect(m.id)}
                        className={`btn pb-filter-chip btn-sm rounded-pill d-flex align-items-center border ${isActive ? 'btn-primary border-primary shadow-sm' : 'btn-white bg-white text-secondary'}`}
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
                );
            })}
        </div>
    );

    return (
        <div className="mb-4 pb-filter-bar">
            {/* --- Desktop/Main View --- */}

            <div className="row g-3">
                <div className="col-12">
                    <label
                        className="form-label small fw-bold text-muted text-uppercase d-block mb-2">Carburante</label>
                    {renderFuelSelector()}
                </div>
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2 d-block">Servizio
                        ricercato</label>
                    {renderServiceChips()}
                </div>
                <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-2 d-block">Marchio</label>
                    {renderMarchioChips()}
                </div>
            </div>

            {/* --- Mobile Bottom Shield --- */}
            <div
                className={`offcanvas offcanvas-bottom rounded-top-4 ${showShield ? 'show' : ''}`}
                tabIndex="-1"
                style={{
                    visibility: showShield ? 'visible' : 'hidden',
                    height: '80vh',
                    zIndex: 2000 /* Valore molto alto per stare sopra la mappa fixed */
                }}
            >
                <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title fw-bold">Filtra Distributori</h5>
                    <button type="button" className="btn-close shadow-none"
                            onClick={() => setShowShield(false)}></button>
                </div>
                <div className="offcanvas-body">
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase">Carburante</label>
                        {renderFuelSelector(true)}
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">Servizi</label>
                        {renderServiceChips()}
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted text-uppercase mb-2">Marchio</label>
                        {renderMarchioChips()}
                    </div>
                </div>
                <div className="p-3 border-top bg-light">
                    <button className="btn btn-dark w-100 py-3 fw-bold rounded-pill"
                            onClick={() => setShowShield(false)}>
                        Mostra Risultati
                    </button>
                </div>
            </div>

            {/* Overlay Background */}
            {showShield && <div className="offcanvas-backdrop fade show" style={{zIndex: 1900}}
                                onClick={() => setShowShield(false)}></div>}

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