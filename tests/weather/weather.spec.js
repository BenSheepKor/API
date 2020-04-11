const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BenSheep');

const axios = require('axios');
const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();

// get the dev api url
const { dev } = require('../../config');
// testing framework for HTTP requests
const request = require('supertest')(dev.url);

const {
    DEFAULT_LOCATION,
    API_URL,
    UNITS,
    APP_ID,
} = require('../../cron/weather/weather.config');

const Weather = require('../../api/models/weatherModel');

const { logInWithValidCredentials } = require('../functions');

describe('get weather information', () => {
    before((done) => {
        const url = `${API_URL}forecast?lat=${DEFAULT_LOCATION.LAT}&lon=${DEFAULT_LOCATION.LNG}&units=${UNITS}&appid=${APP_ID}`;

        axios.get(url).then((res) => {
            saveWeatherData(res.data);
            done();
        });
    });

    it('returns weather information given specific coordinates w/auth', (done) => {
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
