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
            new URL('https://www.wefuel.it/impianto/**')
        ],
    },
    assetPrefix: '/mappa-static',
    sassOptions: {
        quietDeps: true, // silenzia warning da dipendenze
    },
    reactStrictMode: false,
    async redirects() {
        return [
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
