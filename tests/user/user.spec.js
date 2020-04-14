'use-strict';

const chai = require('chai');
// configuration file that includes env options
const config = require('../../config');
// eslint-disable-next-line no-unused-vars
const should = chai.should();
const expect = chai.expect;

// get the dev api url
const url = config.dev.url;
// testing framework for HTTP requests
const request = require('supertest')(url);

const {
    TEST_USER_EMAIL,
    TEST_USERNAME,
    TEST_FACULTY_NAME,
} = require('../../global/messages');

const { logInWithValidCredentials } = require('../functions');

const User = require('../../api/models/userModel');
const Faculty = require('../../api/models/facultyModel');

/**
 * Test script for registering a new user to the platform
 */

describe('register user', () => {
    before((done) => {
        User.findOneAndDelete({ email: TEST_USER_EMAIL }).then(() => {
            done();
        });
    });
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
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.errors[0].should.have
                    .property('status')
                    .and.to.be.equal(409);
                done();
            });
    });

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
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.errors[0].should.have
                    .property('status')
                    .and.to.be.equal(422);
                done();
            });
    });

    /**
     * Test scirpt for attempt to register a user with a password that is not strong enough.
     * Passwords must be at least 8 characters long and contain a number.
     */
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
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                res.body.errors[0].should.have
                    .property('status')
                    .and.to.be.equal(422);
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

    before('give username to user', () => {
        User.findOne({ email: TEST_USER_EMAIL }, async (err, user) => {
            if (err) {
                throw new Error(err);
            }

            if (user) {
                user.username = TEST_USERNAME;

                await user.save();
            }
        });
    });

    it('successfully logs in a user with his username and password', (done) => {
        logInWithValidCredentials(true)
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

    /**
     * Test script for attempt to log in an unregistered user. 404 email not found
     */
    it('attempts to login a user that is not registered', (done) => {
        const query = `mutation {
        login(email: "nonexisten@email.com", password: "safepassword123") {
            token
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

                res.body.errors[0].should.have
                    .property('status')
                    .and.to.be.equal(404);
                done();
            });
    });

    /**
     * Test script for attempt to log in a user with a wrong password. 401 wrong password
     */
    it('attempts to login a user with wrong password', (done) => {
        const query = `mutation {
        login(email: "test@mocha.com", password: "wrongpassword123") {
            token
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

                res.body.errors[0].should.have
                    .property('status')
                    .and.to.be.equal(401);
                done();
            });
    });
});

/**
 * Test for me query endpoint
 */

describe('/me', () => {
    it('retrieve user information', (done) => {
        const query = `query {
            me {
                email,
            }
        }`;

        request
            .post('/graphql')
            .send({
                query: 'query{me{username}}',
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                res.body.errors[0].should.have
                    .property('status')
                    .and.to.be.equal(401);

                logInWithValidCredentials().end((err, res) => {
                    if (err) {
                        throw new Error(err);
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
});

describe('User and faculty', () => {
    it('links a user and a faculty', (done) => {
        console.log('----------------');
        Faculty.findOne({ name: TEST_FACULTY_NAME }, async (err, faculty) => {
            if (err) {
                throw new Error(err);
            }

            if (faculty) {
                await User.findOne(
                    { email: TEST_USER_EMAIL },
                    async (err, user) => {
                        if (err) {
                            throw new Error(err);
                        }

                        if (user) {
                            user.faculty_id = faculty._id;
                            await user.save();
                        }
                    }
                );

                await User.findOne({ email: TEST_USER_EMAIL }, (err, user) => {
                    if (err) {
                        throw new Error(err);
                    }

                    if (user) {
                        expect(user).to.have.property('faculty_id');
                        expect(user.faculty_id.toString()).equals(
                            faculty._id.toString()
                        );
                        done();
                    }
                });
            }
        });
    });
});
