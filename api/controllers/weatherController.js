'use strict';

// Get mongoose to connect with the mongodb database
const mongoose = require('mongoose');

// Get the User model
const Weather = mongoose.model('Weather');

exports.getWeatherByCoordinates = (args, req) => {
    if (req.headers.authorization) {
        // Check that it as indeed a Bearer token
        if (req.headers.authorization.indexOf('Bearer ') !== -1) {
            // remove the Bearer prefix and store the token

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
    }

    throw new Error('NO_AUTH');
};
