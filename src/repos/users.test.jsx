import {createUser, getUserByEmail} from './users.jsx';
import {connectToDatabase} from './mysql.jsx';

// Mock della connessione al database
jest.mock('./mysql.jsx', () => ({
    connectToDatabase: jest.fn(),
}));

describe('Users Repository', () => {
    let mockConnection;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup del mock della connessione
        mockConnection = {
            execute: jest.fn(),
            end: jest.fn(),
        };
        connectToDatabase.mockResolvedValue(mockConnection);
    });

    describe('getUserByEmail', () => {
        it('dovrebbe restituire un utente se l\'email esiste', async () => {
            const mockUser = {id: 1, email: 'test@example.com', name: 'Alessandro'};
            mockConnection.execute.mockResolvedValue([[mockUser]]);

            const result = await getUserByEmail('test@example.com');

            expect(mockConnection.execute).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE email = ?',
                ['test@example.com']
            );
            expect(result).toEqual(mockUser);
            expect(mockConnection.end).toHaveBeenCalled();
        });

        it('dovrebbe restituire null se l\'email non esiste', async () => {
            mockConnection.execute.mockResolvedValue([[]]);

            const result = await getUserByEmail('notfound@example.com');

            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('dovrebbe inserire un nuovo utente e restituirne i dati', async () => {
            const userData = {
                email: 'new@example.com',
                name: 'Nuovo Utente',
                googleId: 'google-123',
                avatar: 'https://avatar.url'
            };

            const mockCreatedUser = {id: 2, ...userData};

            mockConnection.execute
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([[mockCreatedUser]]);

            const result = await createUser(userData);

            expect(mockConnection.execute).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                [userData.email, userData.name, userData.googleId, userData.avatar]
            );

            expect(mockConnection.execute).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE email = ?',
                [userData.email]
            );

            expect(result).toEqual(mockCreatedUser);
        });
    });
});