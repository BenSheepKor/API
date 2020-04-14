'use-strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BenSheep');

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

const Location = require('../../api/models/locationModel');

const { TEST_LOCATION } = require('../../global/messages');

describe('Location', () => {
    before('delete all location data', (done) => {
        Location.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            done();
        });
    });

    it('successfully and correctly stores a location to the database', (done) => {
        const location = new Location({ name: TEST_LOCATION });

        location.save((err, location) => {
            if (err) {
                throw new Error('asdasdasd');
            }
            location._doc.name.should.be.equal(TEST_LOCATION);
            done();
        });
    });
});
