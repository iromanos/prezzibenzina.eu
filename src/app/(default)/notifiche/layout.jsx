import {getCanonicalUrl, getOpenGraph, getTwitter} from "@/functions/server";
import {headers} from "next/headers";

export async function generateMetadata() {
    const title = 'Le Mie Notifiche Prezzo | PrezziBenzina.eu';
    const description = 'Gestisci le tue sottoscrizioni per ricevere avvisi personalizzati sui prezzi dei carburanti in tempo reale.';
    const imageUrl = '/assets/logo-og.png';
    const headerList = await headers();
    const canonicalUrl = getCanonicalUrl(headerList);

    return {
        title: title,
        description: description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },
        },
        openGraph: getOpenGraph(canonicalUrl, title, description, imageUrl),
        twitter: getTwitter(title, description, imageUrl),
    };
}

export default function NotificheLayout({children}) {
    return (
        <>
            {children}
        </>
    );
}