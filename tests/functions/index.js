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

module.exports.sendQuery = (query) => {
    return request.post('/graphql').send({ query }).expect(200);
};

module.exports.sendAuthQuery = (query, token) => {
    return request
        .post('/graphql')
        .send({ query })
        .set('Authorization', 'Bearer ' + token)
        .expect(200);
};

module.exports.expect404 = (err, res, done) => {
    if (err) {
        throw new Error(err);
    }
    res.body.errors[0].should.have.property('status').and.to.be.equal(404);
    done();
};

module.exports.expect422 = (err, res, done) => {
    if (err) {
        throw new Error(err);
    }

    res.body.errors[0].should.have.property('status').and.to.be.equal(422);
    done();
};

module.exports.expect409 = (err, res, done) => {
    if (err) {
        throw new Error(err);
    }

    res.body.errors[0].should.have.property('status').and.to.be.equal(409);
    done();
};

module.exports.expect401 = (err, res, done = false) => {
    if (err) {
        throw new Error(err);
    }

    res.body.errors[0].should.have.property('status').and.to.be.equal(401);

    if (done) {
        done();
    }
};
