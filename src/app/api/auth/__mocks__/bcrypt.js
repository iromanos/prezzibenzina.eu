// src/app/api/auth/__mocks__/bcrypt.js
const mockHash = jest.fn();
const mockCompare = jest.fn();

module.exports = {
    hash: mockHash,
    compare: mockCompare,
};