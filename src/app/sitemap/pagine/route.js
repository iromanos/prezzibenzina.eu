export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    return [
        {
            url: `${baseUrl}/prezzi-medi-regione`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ];
}