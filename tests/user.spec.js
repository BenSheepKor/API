'use-strict';

const chai = require('chai');
// configuration file that includes env options
const config = require('../config');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

// get the dev api url
const url = config.dev.url;
// testing framework for HTTP requests
const request = require('supertest')(url);

describe('register user', () => {
    it('registers a user using a unique email and a password', (done) => {
        request
            .post('/graphql')
            .send({
                query:
                    'mutation{register(email: "test@mocha.com", password: "safepassword123"){id,email}}',
            })
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

    it('tries to register a user with an email that already exists', (done) => {
        request
            .post('/graphql')
            .send({
                query:
                    'mutation{register(email: "test@mocha.com", password: "safepassword123"){id,email}}',
            })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                res.body.errors[0].statusCode.should.equal(409);
                done();
            });
    });

    it('tries to register a user with an invalid email', (done) => {
        request
            .post('/graphql')
            .send({
                query:
                    'mutation{register(email: "invalidemail.com", password: "safepassword123"){id,email}}',
            })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.errors[0].statusCode.should.equal(422);
                done();
            });
    });
    // Passwords must be at least 8 characters long and contain a number.
    it('tries to register a user with an invalid password', (done) => {
        request
            .post('/graphql')
            .send({
                query:
                    'mutation{register(email: "invalid@email.com", password: "badpass"){id,email}}',
            })
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

    it('tries to login a user that is not registered', (done) => {
        request
            .post('/graphql')
            .send({
                query:
                    'mutation{login(email: "nonexisten@email.com", password: "safepassword123"){token}}',
            })
            .expect(500)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                res.body.errors[0].statusCode.should.equal(404);
                done();
            });
    });

    it('tries to login a user with wrong password', (done) => {
        request
            .post('/graphql')
            .send({
                query:
                    'mutation{login(email: "test@mocha.com", password: "wrongpassword123"){token}}',
            })
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

describe('get user information /me', () => {
    it('sends a request to me query with correct auth token', (done) => {
        logInWithValidCredentials().end((err, res) => {
            request
                .post('/graphql')
                .send({
                    query: 'query{me{email}}',
                })
                .set('Authorization', 'Bearer ' + res.body.data.login.token)
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
    return request.post('/graphql').send({
        query:
            'mutation{login(email: "test@mocha.com", password: "safepassword123"){token}}',
    });
}
