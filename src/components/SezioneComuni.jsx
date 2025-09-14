import MappaWrapper from "@/components/MappaWrapper";
import {getDistributoriRegione, getSeoRegione} from "@/functions/api";
import React from "react";
import Link from 'next/link';

export default function SezioneComuni({regione, comuni}) {
    return <>
        {/* 🔗 Link ai comuni */}
        <section className="mb-4">
            <h2 className="h5 mb-3">Città principali</h2>
            <div className="d-flex flex-wrap gap-2">
                {comuni.map((comune) => (
                    <Link
                        key={comune}
                        href={`/prezzi/${regione}/carburante/benzina/${comune.toLowerCase()}`}
                        className="btn btn-outline-secondary btn-sm"
                    >
                        {comune.charAt(0).toUpperCase() + comune.slice(1)}
                    </Link>
                ))}
            </div>
        </section></>;
}
