import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationForm from './NotificationForm';
import * as api from '@/functions/api';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({token: 'test-jwt-token', isAuthenticated: true}),
}));
jest.mock('@/components/common/BootstrapModal', () => ({
    __esModule: true,
    default: ({show, title, body, handleClose}) => (show ? <div><h1>{title}</h1><p>{body}</p>
        <button onClick={handleClose}>Close</button>
    </div> : null)
}));
jest.mock('@/functions/api', () => ({
    getImpianto: jest.fn(),
    getComune: jest.fn(),
}));

const mockRegioni = [{id: 'LOM', key: 'lombardia', name: 'Lombardia'}];
const mockProvince = [{id: 'MI', name: 'Milano', regione: 'lombardia'}];
const mockComuni = [{id: '015146', name: 'Milano2'}];

describe('NotificationForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn((url) => {
            const urlStr = url.toString();
            if (urlStr.includes('/api/geo/regioni')) return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockRegioni)
            });
            if (urlStr.includes('/api/geo/province')) return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockProvince)
            });
            if (urlStr.includes('/api/geo/comuni')) return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockComuni)
            });
            if (urlStr.includes('/api/subscriptions')) return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({message: 'Success'})
            });
            return Promise.resolve({ok: true, json: () => Promise.resolve({})});
        });
        api.getComune.mockResolvedValue({id: '015146', provincia_id: 'MI', name: 'Milano2'});
    });

    it('should render, allow user input, and submit a new notification', async () => {
        const user = userEvent.setup();
        const onSubscriptionCreated = jest.fn();
        render(<NotificationForm onSubscriptionCreated={onSubscriptionCreated}/>);

        await waitFor(() => expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument());

        await user.selectOptions(screen.getByLabelText(/Carburante/i), 'Diesel');
        await user.selectOptions(screen.getByLabelText('Livello Geografico'), 'provincia');
        await user.selectOptions(await screen.findByLabelText('Regione'), 'lombardia');
        await user.selectOptions(await screen.findByLabelText('Provincia'), 'MI');
        await user.click(screen.getByLabelText(/Il prezzo scende sotto un valore specifico/i));
        await user.type(await screen.findByLabelText(/Valore Soglia/i), '1.5');
        await user.click(screen.getByRole('button', {name: /Crea Notifica/i}));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/subscriptions/create'),
                expect.objectContaining({
                    body: expect.stringContaining('"fuel_type":"Diesel"')
                })
            );
        });
    });

    it('should correctly prefill the form when using the prefillData prop', async () => {
        const user = userEvent.setup();
        const prefillData = {
            fuel_type: 'Metano',
            geo_level: 'comune',
            geo_code: '015146',
        };

        render(<NotificationForm prefillData={prefillData}/>);

        await waitFor(() => expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument());

        expect(await screen.findByDisplayValue('Metano')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Comunale')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Lombardia')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Milano2')).toBeInTheDocument();

        await user.click(screen.getByRole('button', {name: /Crea Notifica/i}));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/subscriptions/create'),
                expect.objectContaining({
                    body: expect.stringContaining('"fuel_type":"Metano"'),
                })
            );
        });
    });
});
