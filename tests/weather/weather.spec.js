const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BenSheep');

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

// get the dev api url
const { dev } = require('../../config');
// testing framework for HTTP requests
const request = require('supertest')(dev.url);

const Weather = require('../../api/models/weatherModel');

const { CITY, ENDPOINTS } = require('../../config/weather.config');

// FUNCTIONS
const { logInWithValidCredentials } = require('../functions');
const { fetchWeatherData } = require('../../global/functions');

describe('get weather data', () => {
    before((done) => {
        Weather.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            fetchWeatherData(ENDPOINTS.FORECAST, CITY).then((res) => {
                saveWeatherData(res);
                done();
            });
        });
    });

    it('returns weather data given a specific city', (done) => {
        logInWithValidCredentials().end((err, res) => {
            if (err) {
                throw new Error(err);
            }

            const token = res.body.data.login.token;

            const query = `query {
                weather(city: "${CITY}") {
                    temp,
                    description
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

                    request
                        .post('/graphql')
                        .send({ query })
                        .set('Authorization', 'Bearer ' + token)
                        .expect(200)
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            }

                            res.body.data.weather.should.have.property('temp');
                            res.body.data.weather.should.have.property(
                                'description'
                            );
                            done();
                        });
                });
        });
    });

    it('retrieves weather data given coordinates are not stored in the database', (done) => {
        const query = `query {
            weather(city: "Thessaloniki") {
                temp,
                description
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

                            res.body.data.weather.should.have.property('temp');
                            res.body.data.weather.should.have.property(
                                'description'
                            );
                            done();
                        });
                });
            });
    });
});

function saveWeatherData(weatherObject) {
    const city = weatherObject.city.name;

    for (let i = 0; i < 8; i++) {
        const weatherReport = weatherObject.list[i];

        const weather = new Weather({
            timestamp: weatherReport.dt || 0,
            temp: weatherReport.main.temp || '',
            description: weatherReport.weather[0].description || '',
            city,
        });

        weather.save();
    }
}
