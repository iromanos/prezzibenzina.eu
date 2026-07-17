// src/app/api/auth/logout/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

describe('POST /api/auth/logout', () => {
    beforeEach(() => {
        NextResponse.json.mockClear();
    });

    it('should return a success message for logout', async () => {
        await POST();

        expect(NextResponse.json).toHaveBeenCalledWith(
            {message: 'Logout effettuato con successo (il token JWT deve essere rimosso lato client).'},
            {status: 200}
        );
    });
});