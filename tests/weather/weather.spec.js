const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BenSheep');

const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const should = chai.should();
const expect = chai.expect;

const { TEST_SUITE_SOURCE } = require('../../global/messages');

const Weather = require('../../api/models/weatherModel');

const { CITY, ENDPOINTS } = require('../../config/weather.config');

// FUNCTIONS
const {
    sendQuery,
    sendAuthQuery,
    expect401,
    logInWithValidCredentials,
} = require('../functions');
const { fetchWeatherData } = require('../../global/functions');

// Weather cron job
const { weatherCronJob } = require('../../cron/weather/weather.cron');

describe('get weather data', () => {
    before((done) => {
        Weather.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            fetchWeatherData(ENDPOINTS.FORECAST, CITY)
                .then((res) => {
                    saveWeatherData(res);
                    done();
                })
                .catch((err) => {
                    console.log(err);
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

            sendQuery(query).end((err, res) => {
                expect401(err, res);

                sendAuthQuery(query, token).end((err, res) => {
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

    it('retrieves weather data given coordinates are not stored in the database', (done) => {
        const query = `query {
            weather(city: "Thessaloniki") {
                temp,
                description
            }
        }`;

        sendQuery(query).end((err, res) => {
            expect401(err, res);

            logInWithValidCredentials().end((err, res) => {
                if (err) {
                    throw new Error(err);
                }

                const token = res.body.data.login.token;

                sendAuthQuery(query, token).end((err, res) => {
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
});

describe('Weather cron', () => {
    it('ensures that the weather cron works just fine', async () => {
        const result = await weatherCronJob(CITY, TEST_SUITE_SOURCE);
        expect(result)
            .to.have.property('content')
            .and.to.have.string(`${CITY} weather data`);
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
