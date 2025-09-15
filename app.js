process.env.NODE_ENV = 'production';

const next = require('next/dist/cli/next-start');

next.nextStart({
    port: process.env.PORT || 3000,
});
