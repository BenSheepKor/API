const { dev } = require('../../config');
// testing framework for HTTP requests
const request = require('supertest')(dev.url);

const {
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD,
    TEST_USERNAME,
} = require('../../global/messages');

module.exports.logInWithValidCredentials = (useUserName = false) => {
    let query = `mutation {
        login(email: "${TEST_USER_EMAIL}", password: "${TEST_USER_PASSWORD}") {
            token
        }
    }`;

    if (useUserName) {
        query = `mutation {
            login(username: "${TEST_USERNAME}", password: "${TEST_USER_PASSWORD}") {
                token
            }
        }`;
    }

    return request.post('/graphql').send({ query });
};
