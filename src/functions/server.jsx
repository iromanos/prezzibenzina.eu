export function getCanonicalUrl(headersList) {
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const pathname = headersList.get('x-invoke-path') || ''; // fallback se disponibile

    return `${protocol}://${host}${pathname}`;
}

export function getTwitter(title, description, imageUrl) {
    return {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
    };
}

export function getOpenGraph(headersList, title, description, imageUrl) {
    return {
        title: title,
        description: description,
        url: getCanonicalUrl(headersList),
        siteName: 'PrezziBenzina.eu',
        images: [
            {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title,
            },
        ],
        locale: 'it_IT',
        type: 'website',
    };
}