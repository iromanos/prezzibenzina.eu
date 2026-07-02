/** @type {import('next').NextConfig} */
const nextConfig = {
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    devIndicators: false,
    experimental: {
        optimizeCss: true, // Abilita l'inlining del CSS critico
    },
    images: {
        remotePatterns: [
            new URL('http://localhost:8080/impianto/**'),
            new URL('http://127.0.0.1:8080/impianto/**'),
            new URL('https://www.wefuel.it/pb/impianto/**')
        ],
    },
    sassOptions: {
        quietDeps: true, // silenzia warning da dipendenze
    },
    reactStrictMode: false,
    async redirects() {
        return [
            {
                source: '/lombardia/:carburante/provincia/mi/milano',
                destination: '/lombardia/milano/prezzo-:carburante',
                permanent: true,
            },
            {
                source: '/lombardia/:carburante/provincia/mi/milano/marchio/:marchio',
                destination: '/lombardia/milano/prezzo-:carburante-:marchio',
                permanent: true,
            },
            {
                source: '/:segment*/gasolio/:rest*',
                destination: '/:segment*/diesel/:rest*',
                permanent: true,
            },
            {
                source: '/risultati',
                destination: '/mappa',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
