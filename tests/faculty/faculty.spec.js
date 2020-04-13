'use-strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BenSheep');
mongoose.set('useFindAndModify', false);

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

const Faculty = require('../../api/models/facultyModel');
const Location = require('../../api/models/locationModel');

describe('Faculty', () => {
    const locationName = 'Corfu';

    before('delete all faculty data', (done) => {
        Faculty.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            done();
        });
    });

    it('successfully and correctly stores a faculty to the database', (done) => {
        const name = 'Ionian University';
        const city = locationName;

        const faculty = new Faculty({ name, city });

        faculty.save((err, faculty) => {
            if (err) {
                throw new Error(err);
            }

            faculty.toObject().name.should.be.equal(name);
            faculty.toObject().city.should.be.equal(locationName);
            done();
        });
    });

    it('links a faculty with its respective city', (done) => {
        const city = locationName;
        const name = city;

        Faculty.find({ city }, (err, faculties) => {
            if (err) {
                throw new Error();
            }

            if (faculties.length) {
                faculties.forEach((faculty) => {
                    Location.updateOne(
                        { name },
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
