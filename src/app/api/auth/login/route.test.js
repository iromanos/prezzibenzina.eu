// src/app/api/auth/login/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';
import {_mockCreateConnection, _mockExecute} from '../../__mocks__/mysql2';
import {compare as mockBcryptCompare} from '../../__mocks__/bcrypt';
import {sign as mockJwtSign} from '../../__mocks__/jsonwebtoken';

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockBcryptCompare.mockResolvedValue(true); // Password matches by default
        mockJwtSign.mockReturnValue('mocked_jwt_token');
        _mockCreateConnection.mockClear();
        _mockExecute.mockClear();
        NextResponse.json.mockClear();
    });

    it('should log in a user successfully and return a token', async () => {
        _mockExecute.mockResolvedValueOnce([[{id: 1, email: 'test@example.com', password_hash: 'hashed_password'}]]);

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(_mockCreateConnection).toHaveBeenCalledTimes(1);
        expect(_mockExecute).toHaveBeenCalledWith('SELECT id, email, password_hash FROM users WHERE email = ?', ['test@example.com']);
        expect(mockBcryptCompare).toHaveBeenCalledWith('password123', 'hashed_password');
        expect(mockJwtSign).toHaveBeenCalledWith({
            userId: 1,
            email: 'test@example.com'
        }, process.env.JWT_SECRET, {expiresIn: '1h'});
        expect(NextResponse.json).toHaveBeenCalledWith({
            message: 'Login avvenuto con successo.',
            token: 'mocked_jwt_token'
        }, {status: 200});
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

    it('should return 401 if user not found', async () => {
        _mockExecute.mockResolvedValueOnce([[]]); // No user found

        const mockRequest = {
            json: () => Promise.resolve({email: 'nonexistent@example.com', password: 'password123'}),
        };

        await POST(mockRequest);

        expect(_mockExecute).toHaveBeenCalledWith('SELECT id, email, password_hash FROM users WHERE email = ?', ['nonexistent@example.com']);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Credenziali non valide.'}, {status: 401});
        expect(mockBcryptCompare).not.toHaveBeenCalled();
        expect(mockJwtSign).not.toHaveBeenCalled();
    });

    it('should return 401 if password does not match', async () => {
        _mockExecute.mockResolvedValueOnce([[{id: 1, email: 'test@example.com', password_hash: 'hashed_password'}]]);
        mockBcryptCompare.mockResolvedValue(false); // Password does not match

        const mockRequest = {
            json: () => Promise.resolve({email: 'test@example.com', password: 'wrongpassword'}),
        };

        await POST(mockRequest);

        expect(mockBcryptCompare).toHaveBeenCalledWith('wrongpassword', 'hashed_password');
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Credenziali non valide.'}, {status: 401});
        expect(mockJwtSign).not.toHaveBeenCalled();
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