'use strict';

// Get mongoose to connect with the mongodb database
const mongoose = require('mongoose');

// Get models
const Weather = mongoose.model('Weather');

const { checkForToken, isAuthorized } = require('../../global/functions');

exports.getWeatherByCoordinates = async (args, req) => {
    // retrieve the token
    const token = checkForToken(req);

    // make sure token matches a registered user;
    if (await isAuthorized(token)) {
        // extract coordinates
        const { lat, lng } = args;

        // make sure both coordinates are set
        if (lat && lng) {
            return Weather.find({ location: { lat, lng } })
                .sort({ timestamp: 'asc' })
                .limit(2)
                .then((weatherDocuments, error) => {
                    if (error) {
                        throw new Error(error);
                    }

                    const now = Date.now();

                    const weatherForNow =
                        Math.abs(weatherDocuments[0].timestamp - now) <
                        Math.abs(weatherDocuments[1].timestamp - now)
                            ? weatherDocuments[0]
                            : weatherDocuments[1];

                    return weatherForNow;
                });
        }
    }

    throw new Error('NO_AUTH');
};
