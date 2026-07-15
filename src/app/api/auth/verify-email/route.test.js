// src/app/api/auth/verify-email/route.test.js
import {GET} from './route';
import {NextResponse} from 'next/server';
import {_mockCreateConnection, _mockExecute} from '../../../__mocks__/mysql2';

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
        redirect: jest.fn((url) => ({status: 302, headers: {Location: url}})), // Mock per redirect
    },
}));

describe('GET /api/auth/verify-email', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        _mockCreateConnection.mockClear();
        _mockExecute.mockClear();
        NextResponse.json.mockClear();
        NextResponse.redirect.mockClear();
    });

    it('should verify email successfully and redirect', async () => {
        _mockExecute.mockResolvedValueOnce([[{id: 1}]]); // User found with token
        _mockExecute.mockResolvedValueOnce([{affectedRows: 1}]); // User updated

        const mockRequest = {
            url: 'http://localhost:3000/api/auth/verify-email?token=valid_token',
        };

        await GET(mockRequest);

        expect(_mockCreateConnection).toHaveBeenCalledTimes(1);
        expect(_mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE verification_token = ?', ['valid_token']);
        expect(_mockExecute).toHaveBeenCalledWith('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?', [1]);
        expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/auth/verification-success', mockRequest.url));
    });

    it('should return 400 if token is missing', async () => {
        const mockRequest = {
            url: 'http://localhost:3000/api/auth/verify-email',
        };

        await GET(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Token di verifica mancante.'}, {status: 400});
        expect(_mockCreateConnection).not.toHaveBeenCalled();
    });

    it('should return 400 if token is invalid or expired', async () => {
        _mockExecute.mockResolvedValueOnce([[]]); // No user found with token

        const mockRequest = {
            url: 'http://localhost:3000/api/auth/verify-email?token=invalid_token',
        };

        await GET(mockRequest);

        expect(_mockExecute).toHaveBeenCalledWith('SELECT id FROM users WHERE verification_token = ?', ['invalid_token']);
        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Token di verifica non valido o scaduto.'}, {status: 400});
        expect(_mockExecute).not.toHaveBeenCalledWith('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?', expect.any(Array));
    });

    it('should return 500 for database errors', async () => {
        _mockExecute.mockRejectedValueOnce(new Error('DB connection failed'));

        const mockRequest = {
            url: 'http://localhost:3000/api/auth/verify-email?token=valid_token',
        };

        await GET(mockRequest);

        expect(NextResponse.json).toHaveBeenCalledWith({error: 'Errore interno del server.'}, {status: 500});
    });
});