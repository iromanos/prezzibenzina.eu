// src/app/api/auth/__mocks__/crypto.js
const mockRandomBytes = jest.fn(() => ({
    toString: jest.fn(() => 'mocked_token_hex'),
}));

module.exports = {
    randomBytes: mockRandomBytes,
};