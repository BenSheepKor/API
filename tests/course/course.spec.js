'use-strict';

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

const Course = require('../../api/models/courseModel');

const {
    sendQuery,
    sendAuthQuery,
    expect401,
    expect404,
    expect409,
    logInWithValidCredentials,
} = require('../functions');

describe('Courses', () => {
    const COURSE_NAME = 'networks';

    const QUERY = `query {
        myCourses{
            name,
            schedule {
                day
                start
            }
        }
    }`;

    before('Delete any courses that might exists', (done) => {
        Course.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            done();
        });
    });

    it('adds a course for a user', (done) => {
        addCourse(done);
    });

    it("retrieves a list of the user's courses", (done) => {
        sendQuery(QUERY).end((err, res) => {
            if (err) {
                throw new Error(err);
            }

            expect401(err, res);

            logInWithValidCredentials().end((err, res) => {
                if (err) {
                    throw new Error(err);
                }

                const token = res.body.data.login.token;

                sendAuthQuery(QUERY, token).end((err, res) => {
                    if (err) {
                        throw new Error(err);
                    }

                    const course = res.body.data.myCourses[0];

                    res.body.data.myCourses.should.be.a('array');
                    course.should.have.property('name');
                    course.name.should.equal(COURSE_NAME);

                    // in js array of objects is of type object
                    course.should.have
                        .property('schedule')
                        .and.should.be.a('object');

                    const schedule = course.schedule[0];
                    schedule.should.have.keys('day', 'start');
                    done();
                });
            });
        });
    });

    it('updates a course for a user', (done) => {
        const query = `mutation {
            updateCourse(name: "${COURSE_NAME}", schedule: {
                day: 3,
                start: 520,
                end: 660,
            }) {
                name,
                schedule{
                    day
                }
            }
        }`;

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

                    res.body.data.updateCourse.should.have
                        .property('name')
                        .and.to.be.equal(COURSE_NAME);

                    res.body.data.updateCourse.should.have
                        .property('schedule')
                        .and.to.be.a('array')
                        .and.have.lengthOf(2);
                    done();
                });
            });
        });
    });

    it('attemps to create a course that already exists and fails', (done) => {
        const query = `mutation {
            addCourse(name: "${COURSE_NAME}", schedule: {
                day: 1,
                start: 520,
                end: 660,
            }) {
                name
            }
        }`;

        logInWithValidCredentials().end((err, res) => {
            if (err) {
                throw new Error(err);
            }

            const token = res.body.data.login.token;

            sendAuthQuery(query, token).end((err, res) => {
                expect409(err, res, done);
            });
        });
    });

    it('attempts to update a course that does not exist but fails', (done) => {
        const query = `mutation {
            updateCourse(name: "${COURSE_NAME}_not_existing", schedule: {
                day: 3,
                start: 520,
                end: 660,
            }) {
                name,
                schedule{
                    day
                }
            }
        }`;

        sendQuery(query).end((err, res) => {
            expect401(err, res);

            logInWithValidCredentials().end((err, res) => {
                if (err) {
                    throw new Error(err);
                }

                const token = res.body.data.login.token;

                sendAuthQuery(query, token).end((err, res) => {
                    expect404(err, res, done);
                });
            });
        });
    });

    after('adds course after deletion so we have data to work with', (done) => {
        addCourse(done);
    });

    it('deletes a course for a user', (done) => {
        const query = `mutation {
            deleteCourse(name: "${COURSE_NAME}")
        }`;

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

                    res.body.data.deleteCourse.should.equal(true);
                    done();
                });
            });
        });
    });

    const addCourse = (done) => {
        const query = `mutation {
            addCourse(name: "${COURSE_NAME}", schedule: {
                day: 1,
                start: 520,
                end: 660,
            }) {
                name
            }
        }`;

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

                    const course = res.body.data.addCourse;

                    course.should.have
                        .property('name')
                        .and.be.equal(COURSE_NAME);
                    done();
                });
            });
        });
    };
});
