// src/app/api/auth/register/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';
import {_mockCreateConnection, _mockExecute} from '../__mocks__/mysql2';
import {hash as mockBcryptHash} from '../__mocks__/bcrypt';

// Mock di next/server per NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockBcryptHash.mockResolvedValue('hashed_password');
        _mockCreateConnection.mockClear();
        _mockExecute.mockClear();
        NextResponse.json.mockClear();
    });

    it('should register a user successfully', async () => {
        _mockExecute.mockResolvedValueOnce([[]]); // No existing user
        _mockExecute.mockResolvedValueOnce([{affectedRows: 1}]); // User inserted

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'password123'}),
        };

        const response = await POST(mockRequest);

        expect(_mockCreateConnection).toHaveBeenCalledTimes(1);
        expect(_mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE email = ?', ['test@example.com']);
        expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
        expect(_mockExecute).toHaveBeenCalledWith('INSERT INTO users (email, password_hash) VALUES (?, ?)', ['test@example.com', 'hashed_password']);
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'Registrazione avvenuta con successo.'}, {status: 201});
    });

    it('should return 400 if email is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({password: 'password123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email e password sono obbligatori.'}, {status: 400});
        expect(_mockCreateConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if password is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email e password sono obbligatori.'}, {status: 400});
        expect(_mockCreateConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if email format is invalid', async () => {
        const mockRequest = {
            json: () => Promise.resolve({email: 'invalid-email', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Formato email non valido.'}, {status: 400});
        expect(_mockCreateConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if password is too short', async () => {
        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'short'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'La password deve contenere almeno 6 caratteri.'}, {status: 400});
        expect(_mockCreateConnection).not.toHaveBeenCalled();
    });

    it('should return 409 if user already exists', async () => {
        _mockExecute.mockResolvedValueOnce([[{id: 1}]]); // User already exists

        const mockRequest = {
            json: () => Promise.resolve({email: 'existing@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(_mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE email = ?', ['existing@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Un utente con questa email esiste già.'}, {status: 409});
        expect(mockBcryptHash).not.toHaveBeenCalled(); // Should not hash if user exists
    });

    it('should return 500 for database errors', async () => {
        _mockExecute.mockRejectedValueOnce(new Error('DB connection failed'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
    });
});