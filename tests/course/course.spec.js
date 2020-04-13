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

    it('modifies a course for a user', (done) => {
        const query = `mutation {
            addCourse(name: "${COURSE_NAME}", schedule: {
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

                            res.body.data.addCourse.should.have
                                .property('name')
                                .and.to.be.equal(COURSE_NAME);

                            res.body.data.addCourse.should.have
                                .property('schedule')
                                .and.to.be.a('array')
                                .and.have.lengthOf(2);
                            done();
                        });
                });
            });
    });
});
