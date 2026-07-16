import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Indica la cartella principale del tuo progetto Next.js
    dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",

    // Trattandosi di API route (/api/auth/register), 'node' è l'ambiente corretto
    testEnvironment: 'node',
};

export default createJestConfig(customJestConfig);