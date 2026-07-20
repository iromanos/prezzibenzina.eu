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
const mockComuni = [{id: '015146', name: 'Rho'}];

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
        api.getComune.mockResolvedValue({id: '015146', provincia_id: 'MI', name: 'Rho'});
    });

    it('should render, with benzina, nazionale, economico', async () => {
        const user = userEvent.setup();
        const onSubscriptionCreated = jest.fn();
        render(<NotificationForm onSubscriptionCreated={onSubscriptionCreated}/>);

        await waitFor(() => expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument());

        // Cerchiamo il pulsante tramite il suo ruolo e il nome (label)
        const nationalButton = screen.getByRole('button', {name: /nazionale/i});

        // Verifica che abbia la classe 'active'
        expect(nationalButton).toHaveClass('active');

        await user.click(screen.getByRole('button', {name: /Crea Notifica/i}));

        expect(screen.getByText('Successo!')).toBeInTheDocument();

        await user.click(screen.getByRole('button', {name: /Close/i}));

        expect(onSubscriptionCreated).toHaveBeenCalled();
    })


    it('should render, allow user input, and submit a new notification', async () => {
        const user = userEvent.setup();
        const onSubscriptionCreated = jest.fn();
        render(<NotificationForm onSubscriptionCreated={onSubscriptionCreated}/>);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });


        await waitFor(() => expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument());

        // Cerchiamo il pulsante tramite il suo ruolo e il nome (label)
        const nationalButton = screen.getByRole('button', {name: /nazionale/i});

        // Verifica che abbia la classe 'active'
        expect(await nationalButton).toHaveClass('active');

        await user.selectOptions(screen.getByLabelText(/Carburante/i), 'Diesel');

        await user.click(await screen.getByRole('button', {name: /Provincia/i}));


        await user.selectOptions(await screen.findByLabelText('Regione'), 'lombardia');
        await user.selectOptions(await screen.findByLabelText('Provincia'), 'MI');
        await user.click(screen.getByLabelText(/Avvisami sotto una soglia/i));
        await user.type(await screen.findByLabelText(/Valore Soglia/i), '1.5');
        await user.click(screen.getByRole('button', {name: /Crea Notifica/i}));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/subscriptions/create'),
                expect.objectContaining({
                    body: expect.stringContaining('"fuel_type":"diesel"')
                })
            );
        });
    });

    it('should correctly prefill the form con regione', async () => {
        const user = userEvent.setup();
        const prefillData = {
            fuel_type: 'benzina',
            geo_level: 'regione',
            geo_code: 'lombardia',
        };

        render(<NotificationForm prefillData={prefillData}/>);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });

        expect(await screen.findByDisplayValue('Benzina')).toBeInTheDocument();

        const nationalButton = screen.getByRole('button', {name: /regione/i});
        expect(nationalButton).toHaveClass('active');

        expect(await screen.findByDisplayValue('Lombardia')).toBeInTheDocument();

    });


    it('should correctly prefill the form con provincia', async () => {
        const user = userEvent.setup();
        const prefillData = {
            fuel_type: 'benzina',
            geo_level: 'provincia',
            geo_code: 'mi',
        };

        render(<NotificationForm prefillData={prefillData}/>);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
        });

        expect(await screen.findByDisplayValue('Benzina')).toBeInTheDocument();

        const nationalButton = screen.getByRole('button', {name: /provincia/i});
        expect(nationalButton).toHaveClass('active');


        expect(await screen.findByDisplayValue('Milano')).toBeInTheDocument();


    });


    it('should correctly prefill the form when using the prefillData prop', async () => {
        const user = userEvent.setup();
        const prefillData = {
            fuel_type: 'metano',
            geo_level: 'comune',
            geo_code: '015146',
        };

        render(<NotificationForm prefillData={prefillData}/>);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/regioni');
            expect(fetch).toHaveBeenCalledWith('/api/geo/province');
            expect(api.getComune).toHaveBeenCalled();
        });
        

        await waitFor(() => expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument());

        expect(await screen.findByDisplayValue('Metano')).toBeInTheDocument();
        const nationalButton = screen.getByRole('button', {name: /comune/i});
        expect(nationalButton).toHaveClass('active');

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/geo/comuni?provincia=MI');
        });


        // screen.debug(screen.getByLabelText("Regione"));
        // screen.debug(screen.getByLabelText("Provincia"));


        expect(await screen.getByDisplayValue('Lombardia')).toBeInTheDocument();
        expect(await screen.getByDisplayValue('Milano')).toBeInTheDocument();
        expect(await screen.getByDisplayValue('Rho')).toBeInTheDocument();


        screen.debug(screen.getByLabelText("Comune"));


        await user.click(screen.getByRole('button', {name: /Crea Notifica/i}));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/subscriptions/create'),
                expect.objectContaining({
                    body: expect.stringContaining('"fuel_type":"metano"'),
                })
            );
        });
    });
});