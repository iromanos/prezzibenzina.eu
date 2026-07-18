import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('NotificationGeoFilters', () => {
    let onGeoFilterChangeMock;

    beforeEach(() => {
        onGeoFilterChangeMock = jest.fn();

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
        render(<NotificationGeoFilters onGeoFilterChange={onGeoFilterChangeMock} />);

        // Aspetta che le API siano state chiamate
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });

        expect(screen.getByLabelText('Livello Geografico')).toHaveValue('nazionale');

        // Verifica la chiamata iniziale
        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenCalledWith({
                livello_geo: 'nazionale',
                codice_geo: 'IT',
            });
        });
    });

    it('should show region select when "Regionale" is selected', async () => {
        const user = userEvent.setup();
        render(<NotificationGeoFilters onGeoFilterChange={onGeoFilterChangeMock} initialGeoLevel="nazionale" />);
 
        // Attendi che i dati geografici siano caricati
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });
 
        await user.selectOptions(screen.getByLabelText('Livello Geografico'), 'regione');
 
        expect(screen.getByLabelText('Regione')).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Regione'), 'lombardia');
        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenLastCalledWith({
                livello_geo: 'regione',
                codice_geo: 'lombardia',
            });
        });
    });

    it('should show province select and call callback correctly', async () => {
        const user = userEvent.setup();
        render(<NotificationGeoFilters onGeoFilterChange={onGeoFilterChangeMock} initialGeoLevel="nazionale" />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });
 

        await user.selectOptions(screen.getByLabelText('Livello Geografico'), 'provincia');
        await user.selectOptions(screen.getByLabelText('Regione'), 'lombardia');
        
        expect(await screen.findByLabelText('Provincia')).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText('Provincia'), 'MI');
        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenLastCalledWith({
                livello_geo: 'provincia',
                codice_geo: 'MI',
            });
        });
    });

    it('should show comune select and fetch comuni', async () => {
        const user = userEvent.setup();
        render(<NotificationGeoFilters onGeoFilterChange={onGeoFilterChangeMock} initialGeoLevel="nazionale" />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });


        await user.selectOptions(screen.getByLabelText('Livello Geografico'), 'comune');
        await user.selectOptions(screen.getByLabelText('Regione'), 'lombardia');
        await user.selectOptions(await screen.findByLabelText('Provincia'), 'MI');


        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/comuni?provincia=MI');
        });
        // Aspetta che i comuni vengano caricati
        expect(await screen.findByLabelText('Comune')).toBeInTheDocument();



        await user.selectOptions(screen.getByLabelText('Comune'), 'milano');
        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenLastCalledWith({
                livello_geo: 'comune',
                codice_geo: 'milano',
            });
        });
    });

    it('should initialize correctly for "provincia"', async () => {
        render(
            <NotificationGeoFilters
                onGeoFilterChange={onGeoFilterChangeMock}
                initialGeoLevel="provincia"
                initialGeoCode="MI"
            />
        );

        await waitFor(() => {
            expect(screen.getByLabelText('Livello Geografico')).toHaveValue('provincia');
            expect(screen.getByLabelText('Regione')).toHaveValue('lombardia');
            expect(screen.getByLabelText('Provincia')).toHaveValue('MI');
        });

        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenCalledWith({
                livello_geo: 'provincia',
                codice_geo: 'MI',
            });
        });
    });

    it('should initialize correctly for "comune"', async () => {
        render(
            <NotificationGeoFilters
                onGeoFilterChange={onGeoFilterChangeMock}
                initialGeoLevel="comune"
                initialGeoCode="milano"
            />
        );

        await waitFor(() => expect(api.getComune).toHaveBeenCalledWith('milano'));

        await waitFor(() => {
            expect(screen.getByLabelText('Livello Geografico')).toHaveValue('comune');
            expect(screen.getByLabelText('Regione')).toHaveValue('lombardia');
            expect(screen.getByLabelText('Provincia')).toHaveValue('MI');
        });

        // Aspetta che i comuni vengano caricati e selezionati
        await waitFor(() => {
            expect(screen.getByLabelText('Comune')).toHaveValue('milano');
        });

        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenCalledWith({
                livello_geo: 'comune',
                codice_geo: 'milano',
            });
        });
    });

    it('should be disabled when disabled prop is true', async () => {
        render(
            <NotificationGeoFilters
                onGeoFilterChange={onGeoFilterChangeMock}
                initialGeoLevel="provincia"
                initialGeoCode="MI"
                disabled={true}
            />
        );

        await waitFor(() => {
            expect(screen.getByLabelText('Livello Geografico')).toBeDisabled();
            expect(screen.getByLabelText('Regione')).toBeDisabled();
            expect(screen.getByLabelText('Provincia')).toBeDisabled();
        });
    });

    it('should handle "distributore" level', async () => {
        render(
            <NotificationGeoFilters
                onGeoFilterChange={onGeoFilterChangeMock}
                initialGeoLevel="distributore"
                initialGeoCode="12345"
                disabled={true}
            />
        );

        await waitFor(() => {
            expect(screen.getByLabelText('Livello Geografico')).toHaveValue('distributore');
            expect(screen.getByLabelText('Livello Geografico')).toBeDisabled();
        });

        await waitFor(() => {
            expect(onGeoFilterChangeMock).toHaveBeenCalledWith({
                livello_geo: 'distributore',
                codice_geo: '12345',
            });
        });
    });
});