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

const { DEFAULT_LOCATION, ENDPOINTS } = require('../../config/weather.config');

// FUNCTIONS
const { logInWithValidCredentials } = require('../functions');
const { fetchWeatherData } = require('../../global/functions');

describe('get weather data', () => {
    before((done) => {
        Weather.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            fetchWeatherData(
                ENDPOINTS.FORECAST,
                DEFAULT_LOCATION.LAT,
                DEFAULT_LOCATION.LNG
            ).then((res) => {
                saveWeatherData(res);
                done();
            });
        });
    });

    it('returns weather data given specific coordinates w/ auth', (done) => {
        logInWithValidCredentials().end((err, res) => {
            if (err) {
                throw new Error(err);
            }

            const token = res.body.data.login.token;

            const query = `query {
                weather(lat: ${DEFAULT_LOCATION.LAT}, lng: ${DEFAULT_LOCATION.LNG}) {
                    temp,
                    description
                }
            }`;
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
                    res.body.data.weather.should.have.property('description');
                    done();
                });
        });
    });

    it('attempts to retrieve weather data without auth', (done) => {
        const query = `query {
            weather(lat: ${DEFAULT_LOCATION.LAT}, lng: ${DEFAULT_LOCATION.LNG}) {
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
                done();
            });
    });

    it('retrieves weather data given coordinates are not stored in the database', (done) => {
        logInWithValidCredentials().end((err, res) => {
            if (err) {
                throw new Error(err);
            }

            const token = res.body.data.login.token;

            const query = `query {
                weather(lat: 4.20, lng: 8.24) {
                    temp,
                    description
                }
            }`;
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
                    res.body.data.weather.should.have.property('description');
                    done();
                });
        });
    });
});

function saveWeatherData(weatherObject) {
    const name = weatherObject.city.name;
    const location = {
        lat: DEFAULT_LOCATION.LAT,
        lng: DEFAULT_LOCATION.LNG,
    };

    for (let i = 0; i < 8; i++) {
        const weatherReport = weatherObject.list[i];

        const weather = new Weather({
            timestamp: weatherReport.dt || 0,
            temp: weatherReport.main.temp || '',
            description: weatherReport.weather[0].description || '',
            location,
            name,
        });

        weather.save();
    }
}
