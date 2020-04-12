'use strict';

// Get mongoose to connect with the mongodb database
const mongoose = require('mongoose');

// Get models
const Weather = mongoose.model('Weather');

const {
    checkForToken,
    isAuthorized,
    fetchWeatherData,
} = require('../../global/functions');
const { ENDPOINTS } = require('../../config/weather.config');

exports.getWeatherByCoordinates = async (args, req) => {
    // retrieve the token
    const token = checkForToken(req);

    // make sure token matches a registered user;
    if (await isAuthorized(token)) {
        // extract coordinates
        const { lat, lng } = args;

        // make sure both coordinates are set
        if (lat && lng) {
            /**
             * Get weather data for given coordinates. For each coordinates pair there are 8 documents store. Since this call is about
             * current data we only want the first two becuase one of this is closer to now. @see weatherCron
             *
             * Get only the first 2 more recent documents
             */
            return Weather.find({ location: { lat, lng } })
                .sort({ timestamp: 'asc' })
                .limit(2)
                .then((weatherDocuments, error) => {
                    if (error) {
                        throw new Error(error);
                    }

                    // check that data for given coordinates exists
                    if (weatherDocuments.length) {
                        const now = Date.now();

                        // determine which document's timestamp is closer to now
                        const weatherForNow =
                            Math.abs(weatherDocuments[0].timestamp - now) <
                            Math.abs(weatherDocuments[1].timestamp - now)
                                ? weatherDocuments[0]
                                : weatherDocuments[1];

                        return weatherForNow;
                    }

                    /**
                     * If there is no weather data store for the given coordinates, simply fetch the weather data from the third party api
                     * and return a weather object according to our Model
                     */
                    return fetchWeatherData(ENDPOINTS.WEATHER, lat, lng).then(
                        async (weatherData) => {
                            return await prepareWeatherResponseObject(
                                weatherData
                            );
                        }
                    );
                });
        }
    }

    throw new Error('NO_AUTH');
};

/**
 * Funtion that parses the response extracting the data for our weather model. Then, creates, stores and returns the new weather document
 * @param {Object} fullWeatherResponseObject The API repsponse data from the third party weather api
 * @returns {Weather} A weather object accoring to our model
 */
function prepareWeatherResponseObject(fullWeatherResponseObject) {
    const lat = fullWeatherResponseObject.coord.lat;
    const lng = fullWeatherResponseObject.coord.lon;
    const description = fullWeatherResponseObject.weather[0].description;
    const temp = fullWeatherResponseObject.main.temp;
    const city = fullWeatherResponseObject.name;

    const newWeatherObject = new Weather({
        location: {
            lat,
            lng,
        },
        timestamp: Date.now(),
        description,
        temp,
        city,
    });

    // save new coordinates for future use
    return newWeatherObject
        .save()
        .then(() => {
            return newWeatherObject;
        })
        .catch((error) => {
            throw new Error(error);
        });
}
