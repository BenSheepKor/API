'use-strict';

const chai = require('chai');
// configuration file that includes env options
const config = require('../../config');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

// get the dev api url
const url = config.dev.url;
// testing framework for HTTP requests
const request = require('supertest')(url);

/**
 * Test script for registering a new user to the platform
 */

describe('register user', () => {
    it('registers a user using a unique email and a password', (done) => {
        const query = `mutation {
            register(email: "test@mocha.com", password: "safepassword123") {
                id,
                email
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.data.register.should.have.property('id');
                res.body.data.register.should.have.property('email');
                // To make sure password does not leak
                res.body.data.register.should.not.have.property('password');
                done();
            });
    });
});

/**
 * Test script for attempt to register a user that already exists on the platform
 */

describe('register user', () => {
    it('attempts to register a user with an email that already exists', (done) => {
        const query = `mutation {
            register(email: "test@mocha.com", password: "safepassword123") {
                id,
                email
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.errors[0].statusCode.should.equal(409);
                done();
            });
    });
});

/**
 * Test script for attempt to register a user with an invalid email address
 */
describe('register user ', () => {
    it('attempts to register a user with an invalid email', (done) => {
        const query = `mutation {
            register(email: "invalidemail.com", password: "safepassword123") {
                id,
                email
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.errors[0].statusCode.should.equal(422);
                done();
            });
    });
});

/**
 * Test scirpt for attempt to register a user with a password that is not strong enough.
 * Passwords must be at least 8 characters long and contain a number.
 */
describe('register user ', () => {
    it('attempts to register a user with an invalid password', (done) => {
        const query = `mutation {
            register(email: "invalid@email.com", password: "badpass") {
                id,
                email
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.errors[0].statusCode.should.equal(422);
                done();
            });
    });
});

/**
 * Test script for user log in. Given an email and a password user is successfully logged in and the client gets the token
 */

describe('login user', () => {
    it('successfully logs in a user with his email and password', (done) => {
        logInWithValidCredentials()
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                res.body.data.login.should.have.property('token');
                // to make sure password does not leak
                res.body.data.login.should.not.have.property('password');
                done();
            });
    });
});

/**
 * Test script for attempt to log in an unregistered user. 404 email not found
 */
describe('login user', () => {
    it('attempts to login a user that is not registered', (done) => {
        const query = `mutation {
            login(email: "nonexisten@email.com", password: "safepassword123") {
                token
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                res.body.errors[0].statusCode.should.equal(404);
                done();
            });
    });
});

/**
 * Test script for attempt to log in a user with a wrong password. 401 wrong password
 */
describe('login user', () => {
    it('attempts to login a user with wrong password', (done) => {
        const query = `mutation {
            login(email: "test@mocha.com", password: "wrongpassword123") {
                token
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                res.body.errors[0].statusCode.should.equal(401);
                done();
            });
    });
});

/**
 * Test for me query endpoint
 */

describe('get user information /me', () => {
    it('sends a request to me query with correct auth token', (done) => {
        const query = `query {
            me {
                email,
            }
        }`;

        logInWithValidCredentials().end((err, res) => {
            if (err) {
                return done(err);
            }
            const token = res.body.data.login.token;

            request
                .post('/graphql')
                .send({ query })
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    res.body.data.me.should.have.property('email');
                    done();
                });
        });
    });
});

/**
 * Test for me query endpoint without authentication
 */

describe('get user information /me', () => {
    it('sends a request to me query with an incorrect auth token', (done) => {
        request
            .post('/graphql')
            .send({
                query: 'query{me{username}}',
            })
            .set('Authorization', 'Bearer Bad token')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                res.body.errors[0].statusCode.should.equal(401);
                done();
            });
    });
});

function logInWithValidCredentials() {
    const query = `mutation {
        login(email: "test@mocha.com", password: "safepassword123") {
            token
        }
    }`;

    return request.post('/graphql').send({ query });
}
