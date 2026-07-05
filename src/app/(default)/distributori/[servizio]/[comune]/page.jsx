import {notFound} from 'next/navigation';
import {getComuneBySlug, getServiceBySlug} from "@/lib/data";

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
        title: `Distributori con ${service.name} a ${comuneData.name}`,
        description: `Elenco e mappa dei distributori con ${service.name} a ${comuneData.name}. Orari, prezzi e servizi aggiornati.`,
    };
}

/**
 * Il componente React che renderizza la pagina.
 */
export default async function PaginaDistributoreServizioComune({params}) {
    const {servizio, comune} = await params;

    const [service, comuneData] = await Promise.all([
        getServiceBySlug(servizio),
        getComuneBySlug(comune)
    ]);

    if (!service || !comuneData) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">
                Distributori con {service.name} a {comuneData.name}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Ecco la lista dei distributori che offrono questo servizio a {comuneData.name}.
            </p>

            <div className="p-4 border rounded-lg bg-gray-50">
                <p>Caricamento dei distributori...</p>
            </div>
        </main>
    );
}
