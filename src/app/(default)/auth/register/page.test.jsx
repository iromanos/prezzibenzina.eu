import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from './page';
import {useRouter} from 'next/navigation';

// Mock di next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock della fetch API
global.fetch = jest.fn();

describe('RegisterPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({
            push: mockPush,
        });
    });

    it('should render the registration form', () => {
        render(<RegisterPage/>);

        expect(screen.getByRole('heading', {
            level: 1,
            name: /registrati/i
        })).toBeInTheDocument();

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/conferma password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /registrati/i})).toBeInTheDocument();
        expect(screen.getAllByRole('link', {name: /accedi/i})).toHaveLength(2);
    });

    it('should display an error if passwords do not match', async () => {
        render(<RegisterPage/>);

        fireEvent.change(screen.getByRole('textbox', {id: 'email'}), {target: {value: 'test@example.com'}});
        fireEvent.change(screen.getByRole('password', {id: 'password'}), {target: {value: 'password123'}});


        fireEvent.change(screen.getByRole('password', {id: 'confirmPassword'}), {target: {value: 'differentpassword'}});

        fireEvent.click(screen.getByRole('button', {name: /registrati/i}));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Le password non corrispondono.');
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('should display an error if password is too short', async () => {
        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'test@example.com'}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'short'}});
        fireEvent.change(screen.getByLabelText(/conferma password/i), {target: {value: 'short'}});
        fireEvent.click(screen.getByRole('button', {name: /registrati/i}));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('La password deve contenere almeno 6 caratteri.');
        });
        expect(fetch).not.toHaveBeenCalled(); // Should not call fetch if client-side validation fails
    });


    it('should register successfully and redirect to login', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({message: 'Registrazione avvenuta con successo!'}),
        });

        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'newuser@example.com'}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'password123'}});
        fireEvent.change(screen.getByLabelText(/conferma password/i), {target: {value: 'password123'}});
        fireEvent.click(screen.getByRole('button', {name: /registrati/i}));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith('/api/auth/register', expect.any(Object));
            expect(screen.getByRole('alert')).toHaveTextContent('Registrazione avvenuta con successo! Ora puoi accedere.');
        });
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });

    it('should display an error if registration fails at API level (e.g., email exists)', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({error: 'Un utente con questa email esiste già.'}),
        });

        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'existing@example.com'}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'password123'}});
        fireEvent.change(screen.getByLabelText(/conferma password/i), {target: {value: 'password123'}});
        fireEvent.click(screen.getByRole('button', {name: /registrati/i}));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(screen.getByRole('alert')).toHaveTextContent('Un utente con questa email esiste già.');
        });
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('should display a network error message if fetch fails', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'network@example.com'}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'password123'}});
        fireEvent.change(screen.getByLabelText(/conferma password/i), {target: {value: 'password123'}});
        fireEvent.click(screen.getByRole('button', {name: /registrati/i}));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(screen.getByRole('alert')).toHaveTextContent('Impossibile connettersi al server. Riprova più tardi.');
        });
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('should disable the button and inputs during loading', async () => {
        fetch.mockResolvedValueOnce(new Promise(() => {
        })); // Never resolve to keep loading state

        render(<RegisterPage/>);

        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: 'loading@example.com'}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: 'password123'}});
        fireEvent.change(screen.getByLabelText(/conferma password/i), {target: {value: 'password123'}});
        fireEvent.click(screen.getByRole('button', {name: /registrati/i}));

        expect(screen.getByRole('button', {name: /registrazione in corso.../i})).toBeDisabled();
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/password/i)).toBeDisabled();
        expect(screen.getByLabelText(/conferma password/i)).toBeDisabled();
    });
});