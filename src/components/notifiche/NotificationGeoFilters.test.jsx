import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationGeoFilters from './NotificationGeoFilters';
import * as api from '@/functions/api';

// Mock delle API
jest.mock('@/functions/api', () => ({
    getComune: jest.fn(),
}));

const mockRegioni = [
    { id: 'lombardia', key: 'lombardia', name: 'Lombardia' },
    { id: 'lazio', key: 'lazio', name: 'Lazio' },
];


const mockProvince = [
    { id: 'MI', key: 'MI', name: 'Milano', regione: 'lombardia' },
    { id: 'BS', key: 'BS', name: 'Brescia', regione: 'lombardia' },
    { id: 'RM', key: 'RM', name: 'Roma', regione: 'lazio' },
];

const mockComuni = [
    { id: 'milano', key: 'milano', name: 'Milano' },
    { id: 'roma', key: 'roma', name: 'Roma' },
];

const INITIAL_GEO_FILTERS = {
    livello_geo: 'nazionale',
    codice_geo: 'IT',
    regione: '',
    provincia: '',
};


describe('NotificationGeoFilters', () => {
    // Helper function to render and manage geoFilters state
    const setupNotificationGeoFilters = (initialFilters = INITIAL_GEO_FILTERS, disabled = false) => {
        let currentGeoFilters = {...initialFilters};
        const onGeoFilterChangeMock = jest.fn((newFilters) => {
            // The component sends the full updated geoFilters object, not a partial one.
            // So, we just replace currentGeoFilters with newFilters.
            currentGeoFilters = newFilters;
            rerender(<NotificationGeoFilters onGeoFilterChange={onGeoFilterChangeMock} geoFilters={currentGeoFilters}
                                             disabled={disabled}/>);
        });

        const {rerender, ...rest} = render(<NotificationGeoFilters onGeoFilterChange={onGeoFilterChangeMock}
                                                                   geoFilters={currentGeoFilters}
                                                                   disabled={disabled}/>);

        return {onGeoFilterChangeMock, currentGeoFilters, rerender, ...rest};
    };

    beforeEach(() => {
        jest.clearAllMocks();

        global.fetch = jest.fn((url) => {
            if (url.includes('/api/geo/regioni')) {
                return Promise.resolve({
                    json: () => Promise.resolve(mockRegioni),
                });
            }
            if (url.includes('/api/geo/province')) {
                return Promise.resolve({
                    json: () => Promise.resolve(mockProvince),
                });
            }
            if (url.includes('/api/geo/comuni')) {
                return Promise.resolve({
                    json: () => Promise.resolve(mockComuni.filter(c => c.name === 'Milano')),
                });
            }
            return Promise.reject(new Error('Unhandled fetch call'));
        });

        api.getComune.mockResolvedValue({
            id: 'milano',
            name: 'Milano',
            provincia_id: 'MI',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render and default to "Nazionale"', async () => {
        const {onGeoFilterChangeMock} = setupNotificationGeoFilters();

        // Aspetta che le API siano state chiamate
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });

        // Cerchiamo il pulsante tramite il suo ruolo e il nome (label)
        const nationalButton = screen.getByRole('button', {name: /nazionale/i});

        // Verifica che abbia la classe 'active'
        expect(await nationalButton).toHaveClass('active');
    });

    it('should show region select when "Regionale" is selected', async () => {
        const user = userEvent.setup();
        const {onGeoFilterChangeMock} = setupNotificationGeoFilters();
 
        // Attendi che i dati geografici siano caricati
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });

        const buttonRegione = screen.getByRole('button', {name: /regione/i});

        await user.click(buttonRegione);

        await waitFor(() => {
            expect(buttonRegione).toHaveClass('active');
        });

        await user.selectOptions(screen.getByLabelText('Regione'), 'lombardia');
        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenLastCalledWith({
                livello_geo: 'regione',
                codice_geo: 'lombardia',
                regione: 'lombardia',
                provincia: '',
            });
        });
    });

    it('should show province select and call callback correctly', async () => {
        const user = userEvent.setup();
        const {onGeoFilterChangeMock} = setupNotificationGeoFilters();

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });

        const buttonRegione = screen.getByRole('button', {name: /provincia/i});

        await user.click(buttonRegione);

        await waitFor(() => {
            expect(buttonRegione).toHaveClass('active');
        });


        await user.selectOptions(screen.getByLabelText('Regione'), 'lombardia');
        
        expect(await screen.findByLabelText('Provincia')).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Provincia'), 'MI');
        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenLastCalledWith({
                livello_geo: 'provincia',
                regione: 'lombardia',
                provincia: 'MI',
                codice_geo: 'MI',
            });
        });
    });

    it('should show comune select and fetch comuni', async () => {
        const user = userEvent.setup();
        const {onGeoFilterChangeMock} = setupNotificationGeoFilters();

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });

        const buttonRegione = screen.getByRole('button', {name: /comune/i});

        await user.click(buttonRegione);

        await waitFor(() => {
            expect(buttonRegione).toHaveClass('active');
        });


        await user.selectOptions(screen.getByLabelText('Regione'), 'lombardia');
        await user.selectOptions(await screen.findByLabelText('Provincia'), 'MI');

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/comuni?provincia=MI');
        });
        expect(await screen.findByLabelText('Comune')).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Comune'), 'milano');
        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenLastCalledWith({
                livello_geo: 'comune',
                regione: 'lombardia',
                provincia: 'MI',
                codice_geo: 'milano',
            });
        });
    });

    it('should initialize correctly for "provincia"', async () => {
        const initialGeoFiltersForProvincia = {
            livello_geo: 'provincia',
            codice_geo: 'MI',
            regione: 'lombardia',
            provincia: 'MI',
        };
        setupNotificationGeoFilters(initialGeoFiltersForProvincia);

        await waitFor(() => {

            expect(screen.getByRole('button', {name: /provincia/i})).toHaveClass('active');

            expect(screen.getByLabelText('Regione')).toHaveValue('lombardia');
            expect(screen.getByLabelText('Provincia')).toHaveValue('MI');
        });
    });

    it('should initialize correctly for "comune"', async () => {
        const initialGeoFiltersForComune = {
            livello_geo: 'comune',
            codice_geo: 'milano',
            regione: 'lombardia',
            provincia: 'MI',
        };
        setupNotificationGeoFilters(initialGeoFiltersForComune);

        // await waitFor(() => expect(api.getComune).toHaveBeenCalledWith('milano'));

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /comune/i})).toHaveClass('active');
            expect(screen.getByLabelText('Regione')).toHaveValue('lombardia');
            expect(screen.getByLabelText('Provincia')).toHaveValue('MI');
        });

        await waitFor(() => {
            expect(screen.getByLabelText('Comune')).toHaveValue('milano');
        });
    });

    it('should be disabled when disabled prop is true', async () => {
        const initialGeoFiltersForProvincia = {
            livello_geo: 'provincia',
            codice_geo: 'MI',
            regione: 'lombardia',
            provincia: 'MI',
        };
        setupNotificationGeoFilters(initialGeoFiltersForProvincia, true);

        await waitFor(() => {
            expect(screen.getByLabelText('Regione')).toBeDisabled();
            expect(screen.getByLabelText('Provincia')).toBeDisabled();
        });
    });

    it('should handle "distributore" level', async () => {
        const initialGeoFiltersForDistributore = {
            livello_geo: 'distributore',
            codice_geo: '12345',
            regione: '',
            provincia: '',
        };
        setupNotificationGeoFilters(initialGeoFiltersForDistributore, true);

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /nazionale/i})).toBeDisabled();
            expect(screen.getByRole('button', {name: /regione/i})).toBeDisabled();
            expect(screen.getByRole('button', {name: /provincia/i})).toBeDisabled();
            expect(screen.getByRole('button', {name: /comune/i})).toBeDisabled();
        });
    });
});