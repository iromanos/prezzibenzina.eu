import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import ManageNotificationPage from './page';
import {useRouter, useSearchParams} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';

// Mock dei moduli e componenti esterni
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/components/Header', () => {
    return function DummyHeader() {
        return <header>Header</header>;
    };
});

jest.mock('@/components/notifiche/NotificationForm', () => {
    return function DummyNotificationForm({initialSubscription, subscriptionId, prefillData, onSubscriptionCreated}) {
        return (
            <div>
                <h2>NotificationForm</h2>
                <p>Subscription ID: {subscriptionId || 'none'}</p>
                <p>Initial Subscription: {JSON.stringify(initialSubscription)}</p>
                <p>Prefill Data: {JSON.stringify(prefillData)}</p>
                <button onClick={onSubscriptionCreated}>Trigger Redirect</button>
            </div>
        );
    };
});

describe('ManageNotificationPage', () => {
    let mockRouter;

    beforeEach(() => {
        mockRouter = {
            push: jest.fn(),
        };
        useRouter.mockReturnValue(mockRouter);
        useAuth.mockReturnValue({isAuthenticated: true, token: 'fake-token'});
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test per la modalità CREAZIONE
    it('should render in create mode when no ID is provided', () => {
        useSearchParams.mockReturnValue(new URLSearchParams());

        render(<ManageNotificationPage/>);

        expect(screen.getByText('Crea Nuova Notifica')).toBeInTheDocument();
        expect(screen.getByText('Subscription ID: none')).toBeInTheDocument();
        expect(screen.getByText(/Prefill Data: {"fuel_type":null,"geo_level":null,"geo_code":null}/)).toBeInTheDocument();
    });

    // Test per la modalità CREAZIONE con PRE-RIEMPIMENTO
    it('should render in create mode with prefill data from query params', () => {
        const params = new URLSearchParams();
        params.set('fuel_type', 'diesel');
        params.set('geo_level', 'comune');
        params.set('geo_code', 'milano');
        useSearchParams.mockReturnValue(params);

        render(<ManageNotificationPage/>);

        expect(screen.getByText('Crea Nuova Notifica')).toBeInTheDocument();
        expect(screen.getByText(/Prefill Data: {"fuel_type":"diesel","geo_level":"comune","geo_code":"milano"}/)).toBeInTheDocument();
    });

    // Test per la modalità MODIFICA (successo)
    it('should render in edit mode and fetch subscription data when ID is provided', async () => {
        const params = new URLSearchParams();
        params.set('id', '123');
        useSearchParams.mockReturnValue(params);

        const mockSubscription = {
            id: '123',
            fuel_type: 'benzina',
            geo_level: 'nazionale',
            geo_code: 'IT',
            threshold_type: 'cheapest_in_area',
            threshold_value: null,
            status: 'active'
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSubscription,
        });

        render(<ManageNotificationPage/>);

        expect(screen.getByText('Modifica Notifica')).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith('/api/subscriptions/123', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer fake-token',
            },
        });

        await waitFor(() => {
            expect(screen.getByText('Subscription ID: 123')).toBeInTheDocument();
            expect(screen.getByText(`Initial Subscription: ${JSON.stringify(mockSubscription)}`)).toBeInTheDocument();
        });
    });

    // Test per la modalità MODIFICA (fallimento fetch)
    it('should show an error message if fetching subscription fails', async () => {
        const params = new URLSearchParams();
        params.set('id', '123');
        useSearchParams.mockReturnValue(params);

        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({error: 'Subscription not found'}),
        });

        render(<ManageNotificationPage/>);

        await waitFor(() => {
            expect(screen.getByText('Subscription not found')).toBeInTheDocument();
        });
    });

    // Test per la modalità MODIFICA (non autenticato)
    it('should not fetch subscription if user is not authenticated', () => {
        useAuth.mockReturnValue({isAuthenticated: false, token: null});
        const params = new URLSearchParams();
        params.set('id', '123');
        useSearchParams.mockReturnValue(params);

        render(<ManageNotificationPage/>);

        expect(fetch).not.toHaveBeenCalled();
        expect(screen.getByText('Modifica Notifica')).toBeInTheDocument();
        // Il form viene renderizzato ma senza dati iniziali perché il fetch non parte
        expect(screen.getByText('Initial Subscription: null')).toBeInTheDocument();
    });

    // Test per il reindirizzamento
    it('should redirect to /notifiche when onSubscriptionCreated is called', () => {
        useSearchParams.mockReturnValue(new URLSearchParams());
        render(<ManageNotificationPage/>);

        const redirectButton = screen.getByText('Trigger Redirect');
        redirectButton.click();

        expect(mockRouter.push).toHaveBeenCalledWith('/notifiche');
    });
});