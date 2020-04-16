'use-strict';

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

const {
    TEST_USER_EMAIL,
    TEST_USERNAME,
    TEST_USER_PASSWORD,
    TEST_USER_BAD_EMAIL,
    TEST_USER_BAD_PASSWORD,
    TEST_USER_NON_EXISTENT_EMAIL,
    TEST_USER_NON_EXISTENT_USERNAME,
    TEST_FACULTY_NAME,
} = require('../../global/messages');

const {
    sendQuery,
    sendAuthQuery,
    logInWithValidCredentials,
    expect401,
    expect409,
    expect404,
    expect422,
} = require('../functions');

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
        const query = prepareQuery(
            'register',
            TEST_USER_EMAIL,
            TEST_USER_PASSWORD
        );

        sendQuery(query).end((err, res) => {
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

    it('attempts to register a user with an email that already exists and fails', (done) => {
        const query = prepareQuery(
            'register',
            TEST_USER_EMAIL,
            TEST_USER_PASSWORD
        );

        sendQuery(query).end((err, res) => {
            if (err) {
                return done(err);
            }
            expect409(err, res, done);
        });
    });

    it('attempts to register a user with an invalid email and fails', (done) => {
        const query = prepareQuery(
            'register',
            TEST_USER_BAD_EMAIL,
            TEST_USER_PASSWORD
        );

        sendQuery(query).end((err, res) => {
            expect422(err, res, done);
        });
    });

    /**
     * Test scirpt for attempt to register a user with a password that is not strong enough.
     * Passwords must be at least 8 characters long and contain a number.
     */
    it('attempts to register a user with an invalid password and fails', (done) => {
        const query = prepareQuery(
            'register',
            TEST_USER_EMAIL,
            TEST_USER_BAD_PASSWORD
        );

        sendQuery(query).end((err, res) => {
            expect422(err, res, done);
        });
    });
});

/**
 * Test for me query endpoint
 */

describe('me', () => {
    it('retrieve user information', (done) => {
        const query = prepareQuery('me');

        sendQuery(query).end((err, res) => {
            expect401(err, res);

            logInWithValidCredentials().end((err, res) => {
                if (err) {
                    throw new Error(err);
                }
                const token = res.body.data.login.token;

                sendAuthQuery(query, token).end((err, res) => {
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

/**
 * Test script for user log in. Given an email and a password user is successfully logged in and the client gets the token
 */

describe('newMe', () => {
    let faculty_id;

    before('get faculty id', (done) => {
        Faculty.findOne({ name: TEST_FACULTY_NAME }, (err, faculty) => {
            if (err) {
                throw new Error(err);
            }

            if (faculty) {
                faculty_id = faculty._id.toString();
                done();
            }
        });
    });

    it("Updates a user's data", (done) => {
        const query = prepareNewMeQuery(TEST_USERNAME, faculty_id);

        sendQuery(query).end((err, res) => {
            expect401(err, res);

            logInWithValidCredentials().end((err, res) => {
                if (err) {
                    throw new Error(err);
                }
                const token = res.body.data.login.token;

                sendAuthQuery(query, token).end((err, res) => {
                    if (err) {
                        throw new Error(err);
                    }
                    const response = res.body.data.newMe;

                    response.should.have
                        .property('username')
                        .and.to.be.equal(TEST_USERNAME);

                    response.should.have
                        .property('faculty_id')
                        .and.to.be.equal(faculty_id);
                    done();
                });
            });
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
    it('attempts to login a user with an email that is not registered and fails', (done) => {
        const query = prepareQuery(
            'login',
            TEST_USER_NON_EXISTENT_EMAIL,
            TEST_USER_PASSWORD
        );

        sendQuery(query).end((err, res) => {
            expect404(err, res, done);
        });
    });

    it('attemps to login a user with an invalid email and fails', (done) => {
        const query = prepareQuery(
            'login',
            TEST_USER_BAD_EMAIL,
            TEST_USER_PASSWORD
        );

        sendQuery(query).end((err, res) => {
            expect422(err, res, done);
        });
    });

    it('attempts to login a user with an non registered username and fails', (done) => {
        const query = prepareQuery(
            'login',
            TEST_USER_NON_EXISTENT_USERNAME,
            TEST_USER_PASSWORD,
            false
        );

        sendQuery(query).end((err, res) => {
            expect404(err, res, done);
        });
    });

    /**
     * Test script for attempt to log in a user with a wrong password. 401 wrong password
     */
    it('attempts to login a user with wrong password and fails', (done) => {
        // first try correct email wrong password
        const query = prepareQuery(
            'login',
            TEST_USER_EMAIL,
            TEST_USER_BAD_PASSWORD
        );

        sendQuery(query).end((err, res) => {
            expect401(err, res);

            // then try correct username wrong password

            const query = prepareQuery(
                'login',
                TEST_USERNAME,
                TEST_USER_BAD_PASSWORD,
                false
            );

            sendQuery(query).end((err, res) => {
                expect401(err, res, done);
            });
        });
    });
});

const prepareQuery = (
    endpoint,
    emailOrUsername = '',
    password = '',
    useEmail = true
) => {
    switch (endpoint) {
        case 'register':
            return `mutation {
                register(email: "${emailOrUsername}", password: "${password}") {
                    id,
                    email
                }
            }`;
        case 'me':
            return `query {
                me {
                    email,
                }
            }`;
        case 'login':
            if (!useEmail) {
                return `mutation {
                    login(username: "${emailOrUsername}", password: "${password}") {
                        token
                    }
                }`;
            }
            return `mutation {
                login(email: "${emailOrUsername}", password: "${password}") {
                    token
                }
            }`;
        default:
    }
};

const prepareNewMeQuery = (username, facultyId) => {
    return `mutation {
        newMe(username: "${username}", facultyId: "${facultyId}") {
            id,
            email,
            username,
            faculty_id
        }
    }`;
};
