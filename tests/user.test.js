'use-strict';

// testing framework
const chai = require('chai');
// configuration file that includes env options
const config = require('../config');

// include expect from chai
const should = chai.should();
// get the dev api url
const url = config.dev.url;
// testing framework for HTTP requests
const request = require('supertest')(url);

describe('register user', () => {
    it("registers a user using a unique email and a password", done => {
        request.post('/graphql')
            .send({
                query: `mutation{register(email: \"test@mocha.com\", password: \"safepassword123\"){id,email}}`
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.body.data.register.should.have.property('id');
                res.body.data.register.should.have.property('email');
                res.body.data.register.should.not.have.property('password');
                done();
            })
    })
})

describe('register duplicate user', () => {
    it("A user tries to register with an email that already exists", done => {
        request.post('/graphql')
            .send({
                query: `mutation{register(email: \"test@mocha.com\", password: \"safepassword123\"){id,email}}`
            })
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                res.body.errors[0].statusCode.should.equal(409)
                done();
            })
    })
})
