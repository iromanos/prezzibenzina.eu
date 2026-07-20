// src/app/api/auth/logout/route.test.js
import {POST} from './route';
import {NextResponse} from 'next/server';

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({body, options})),
    },
}));

const mockDelete = jest.fn();

jest.mock('next/headers', () => ({
    cookies: () => ({
        delete: mockDelete,
    }),
}));

describe('POST /api/auth/logout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a success message for logout', async () => {
        await POST();

        expect(mockDelete).toHaveBeenCalled();

        expect(NextResponse.json).toHaveBeenCalledWith(
            {message: 'Logout successful'},
            {status: 200}
        );
    });
});