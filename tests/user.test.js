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

/**
 * Test script for registering a new user to the platform
 */

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
                // To make sure password does not leak
                res.body.data.register.should.not.have.property('password');
                done();
            })
    })
})

/**
 * Test script for attempt to register a user that already exists on the platform
 */

describe('register user', () => {
    it("tries to register a user with an email that already exists", done => {
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

/**
 * Test script for attempt to register a user with an invalid email address
 */
describe('register user ', () => {
    it("tries to register a user with an invalid email", done => {
        request.post('/graphql')
            .send({
                query: `mutation{register(email: \"invalidemail.com\", password: \"safepassword123\"){id,email}}`
            })
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                res.body.errors[0].statusCode.should.equal(422)
                done();
            })
    })
})

/**
 * Test scirpt for attempt to register a user with a password that is not strong enough. 
 * Passwords must be at least 8 characters long and contain a number.
 */
describe('register user ', () => {
    it("tries to register a user with an invalid password", done => {
        request.post('/graphql')
            .send({
                query: `mutation{register(email: \"invalid@email.com\", password: \"badpass\"){id,email}}`
            })
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                res.body.errors[0].statusCode.should.equal(422)
                done();
            })
    })
})

/**
 * Test script for user log in. Given an email and a password user is successfully logged in and the client gets the token
 */

describe('login user', () => {
    it("successfully logs in a user with his email and password", done => {
        request.post('/graphql')
            .send({
                query: `mutation{login(email: \"test@mocha.com\", password: \"safepassword123\"){token}}`
            })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                res.body.data.login.should.have.property('token');
                // to make sure password does not leak
                res.body.data.login.should.not.have.property('password');
                done();
            })
    })
})

/**
 * Test script for attempt to log in an unregistered user. 404 email not found
 */
describe('login user', () => {
    it("tries to login a user that is not registered", done => {
        request.post('/graphql')
            .send({
                query: `mutation{login(email: \"nonexisten@email.com\", password: \"safepassword123\"){token}}`
            })
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);

                res.body.errors[0].statusCode.should.equal(404)
                done();
            })
    })
})

/**
 * Test script for attempt to log in a user with a wrong password. 401 wrong password
 */
describe('login user', () => {
    it("tries to login a user with wrong password", done => {
        request.post('/graphql')
            .send({
                query: `mutation{login(email: \"test@mocha.com\", password: \"wrongpassword123\"){token}}`
            })
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);

                res.body.errors[0].statusCode.should.equal(401)
                done();
            })
    })
})

/**
 * Test for me query endpoint
 */

describe('get user information /me', () => {
    it('sends a request to me query with correct auth token', done => {
        request.post('/graphql')
            .send({
                query: `query{me{username}}`
            })
            .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTE2LjIwMy42NC4xMzo0MDAwIiwic2NvcGUiOiJzZWxmIiwianRpIjoiMDkwNzRhNmMtMDQxNS00ZTNlLTg4ZDAtOTI4YmI5YTE3YzM0IiwiaWF0IjoxNTg0ODMwOTE2LCJleHAiOjE1ODQ4MzQ1MTZ9.oaKDLXSpjFedo6a84I1xU55PeSnTlvaDWj1tdIzPvQ8')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)

                res.body.data.me.should.have.property('username');
                done();
            })
    })
})

/**
 * Test for me query endpoint without authentication
 */

describe('get user information /me', () => {
    it('sends a request to me query with an incorrect auth token', done => {
        request.post('/graphql')
            .send({
                query: `query{me{username}}`
            })
            .set('Authorization', 'Bearer Bad token')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)

                res.body.errors[0].statusCode.should.equal(401);
                done();
            })
    })
})

