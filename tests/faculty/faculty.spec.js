'use-strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BenSheep');
mongoose.set('useFindAndModify', false);

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

const Faculty = require('../../api/models/facultyModel');
const Location = require('../../api/models/locationModel');

const { TEST_FACULTY_NAME, TEST_LOCATION } = require('../../global/messages');

describe('Faculty', () => {
    before('delete all faculty data', (done) => {
        Faculty.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            done();
        });
    });

    it('successfully and correctly stores a faculty to the database', (done) => {
        const faculty = new Faculty({
            name: TEST_FACULTY_NAME,
            city: TEST_LOCATION,
        });

        faculty.save((err, faculty) => {
            if (err) {
                throw new Error(err);
            }

            faculty.toObject().name.should.be.equal(TEST_FACULTY_NAME);
            faculty.toObject().city.should.be.equal(TEST_LOCATION);
            done();
        });
    });

    it('links a faculty with its respective city', (done) => {
        Faculty.find({ city: TEST_LOCATION }, (err, faculties) => {
            if (err) {
                throw new Error();
            }

            if (faculties.length) {
                faculties.forEach((faculty) => {
                    Location.updateOne(
                        { name: TEST_LOCATION },
                        { $push: { faculty_id: faculty._id } },
                        (err, raw) => {
                            if (err) {
                                throw new Error(err);
                            }

                            raw.nModified.should.equal(1);
                            done();
                        }
                    );
                });
            }
        });
    });
});
