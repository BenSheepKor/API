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

const { logInWithValidCredentials } = require('../functions');
const Course = require('../../api/models/courseModel');

describe('Courses', () => {
    // we delete all users and create just one during the test suite. We are confident that said user will have id = 1;
    const USER_ID = 1;
    const COURSE_NAME = 'networks';
    const SCHEDULE = [
        {
            day: 1,
            start: 520,
            end: 660,
        },
        {
            day: 3,
            start: 520,
            end: 660,
        },
    ];

    const QUERY = `query {
        courses(userId: ${USER_ID}) {
            name,
            schedule {
                day
                start
            }
        }
    }`;

    before('create course for user', async (done) => {
        createCourse(USER_ID, COURSE_NAME, SCHEDULE);
        done();
    });

    it("retrieves a list of the user's courses", (done) => {
        request
            .post('/graphql')
            .send({ query: QUERY })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    throw new Error(err);
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
                        .send({ query: QUERY })
                        .set('Authorization', 'Bearer ' + token)
                        .expect(200)
                        .end((err, res) => {
                            if (err) {
                                throw new Error(err);
                            }

                            const course = res.body.data.courses[0];

                            res.body.data.courses.should.be.a('array');
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

    it('adds a course for a user', (done) => {
        const query = `mutation {
            addCourse(name: "${COURSE_NAME}", schedule: {
                day: 1,
                start: 520,
                end: 660,
            }) {
                name
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    throw new Error(err);
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
    });

    it('modifies a course for a user', (done) => {
        const query = `mutation {
            addCourse(name: "${COURSE_NAME}", schedule: {
                day: 3,
                start: 520,
                end: 660,
            }) {
                name
            }
        }`;

        request
            .post('/graphql')
            .send({ query })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    throw new Error(err);
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
                            done();
                        });
                });
            });
    });
});

const createCourse = async (userId, courseName, courseSchedule) => {
    const course = new Course({
        user_id: userId,
        name: courseName,
        schedule: courseSchedule,
    });

    await deleteCourses();

    return await course.save();
};

const deleteCourses = async () => {
    return Course.deleteMany({}, (err) => {
        if (err) {
            throw new Error(err);
        }
    });
};
