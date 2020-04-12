const { dev } = require('../../config');
// testing framework for HTTP requests
const request = require('supertest')(dev.url);

module.exports.logInWithValidCredentials = () => {
    const query = `mutation {
        login(email: "test@mocha.com", password: "safepassword123") {
            token
        }
    }`;

    return request.post('/graphql').send({ query });
};
