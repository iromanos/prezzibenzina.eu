// src/app/api/auth/register/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';
import mysql from 'mysql2/promise';
import {hash as mockBcryptHash} from 'bcrypt';

const mockEnd = jest.fn(() => Promise.resolve());
const mockExecute = jest.fn();
jest.mock('mysql2/promise', () => {
    return {
        createConnection: jest.fn(() => Promise.resolve({
            execute: mockExecute,
            end: mockEnd,
        })),
    };
});

jest.mock('bcrypt');

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
    });

    it('should register a user successfully', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No existing user for SELECT
        mockExecute.mockResolvedValueOnce([{affectedRows: 1}]); // User inserted for INSERT

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE email = ?', ['test@example.com']);
        expect(mockBcryptHash).toHaveBeenCalledWith('password123', 10);
        expect(mockExecute).toHaveBeenCalledWith('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['test@example.com', 'test@example.com', 'hashed_password']);
        expect(mockEnd).toHaveBeenCalledTimes(1); // Verifica che connection.end sia stato chiamato
        expect(NextResponse.json).toHaveBeenCalledWith({message: 'Registrazione avvenuta con successo.'}, {status: 201});
    });

    it('should return 400 if email is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({password: 'password123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email e password sono obbligatori.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled(); // createConnection non dovrebbe essere chiamato
    });

    it('should return 400 if password is missing', async () => {
        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Email e password sono obbligatori.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if email format is invalid', async () => {
        const mockRequest = {
            json: () => Promise.resolve({email: 'invalid-email', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Formato email non valido.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if password is too short', async () => {
        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'short'}),
        };

        await POST(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'La password deve contenere almeno 6 caratteri.'}, {status: 400});
        expect(mysql.createConnection).not.toHaveBeenCalled();
    });

    it('should return 409 if user already exists', async () => {
        mockExecute.mockResolvedValueOnce([[{id: 1}]]); // User already exists for SELECT

        const mockRequest = {
            json: () => Promise.resolve({email: 'existing@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(mysql.createConnection).toHaveBeenCalledTimes(1);
        expect(mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE email = ?', ['existing@example.com']);
        expect(mockEnd).toHaveBeenCalledTimes(1);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Un utente con questa email esiste già.'}, {status: 409});
        expect(mockBcryptHash).not.toHaveBeenCalled(); // Non dovrebbe hashare se l'utente esiste
    });

    it('should return 500 for database errors', async () => {
        // Mock `createConnection` per rifiutare, simulando un errore di connessione al DB
        mysql.createConnection.mockRejectedValueOnce(new Error('DB connection failed'));

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(mysql.createConnection).toHaveBeenCalledTimes(1);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
        expect(mockExecute).not.toHaveBeenCalled(); // Nessuna chiamata a execute se la connessione è fallita
        expect(mockEnd).not.toHaveBeenCalled(); // Nessuna chiamata a end se la connessione è fallita
    });
});