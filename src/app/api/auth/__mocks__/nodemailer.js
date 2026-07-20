// src/app/api/auth/__mocks__/nodemailer.js
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({
    sendMail: mockSendMail,
}));

module.exports = {
    createTransport: mockCreateTransport,
    _mockSendMail: mockSendMail,
    _mockCreateTransport: mockCreateTransport,
};