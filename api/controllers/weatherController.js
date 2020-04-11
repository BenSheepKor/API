'use strict';

// Get mongoose to connect with the mongodb database
const mongoose = require('mongoose');

// Get the User model
const Weather = mongoose.model('Weather');

exports.getWeatherByCoordinates = (args, req) => {
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
};
