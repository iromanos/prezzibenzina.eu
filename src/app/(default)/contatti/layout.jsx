export async function generateMetadata() {
    const canonicalUrl = process.env.NEXT_PUBLIC_BASE_URL + '/contatti';

    return {
        title: 'Contatti e assistenza | PrezziBenzina.eu ',
        description:
            'Hai bisogno di assistenza o vuoi inviarci un feedback? Scopri come contattare il team di PrezziBenzina.eu ' +
            'per supporto, segnalazioni o collaborazioni.',
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'it': canonicalUrl,
                'x-default': canonicalUrl,
            },
        },
        robots: 'index, follow',
    };
}

export default function ContattiLayout({children}) {
    return (
        <>
            {children}
        </>
    );
}