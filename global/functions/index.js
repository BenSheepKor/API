const axios = require('../axios/axios.config');
const User = require('../../api/models/userModel');
const {
    API_URL,
    APP_ID,
    ENDPOINTS,
    UNITS,
} = require('../../config/weather.config');
/**
 * Function that checks for a Bearer token in the request and optioanlly returns said token
 *
 * @param {Object} req The request object
 * @returns {String | Boolean} Returns the token if found else returns false
 */
module.exports.checkForToken = (req) => {
    // is authorization set
    if (req.headers.authorization) {
        // authorization must be of type Bearer token
        if (req.headers.authorization.indexOf('Bearer ') !== -1) {
            // return the token withouth the bearer prefix
            return req.headers.authorization.split('Bearer ')[1];
        }
    }

    return false;
};

/**
 * Function that runs the token in the database to find a user related to it
 * @param {String} token The JWT send in the request
 * @returns {Boolean}  Wethere the token relates to a register user or not
 */
module.exports.isAuthorized = (token) => {
    return User.findOne({ token }).then((user, error) => {
        if (error) {
            throw new Error(error);
        }

        if (user) {
            return user.token === token;
        }

        return false;
    });
};

/**
 * Function that calls the third party weather API. Used a global function for reusability and flexibility in case
 * a different third party api is used in the future
 *
 * @param {string} endpoint The endpoint of the third party api to hit
 * @param {float} lat The latitude of the location coordinates
 * @param {float} lng The longitude of the location coordinates
 *
 * @return {Promise} The promise of the call to the third party api
 */

module.exports.fetchWeatherData = (endpoint, lat, lng) => {
    // ensure all parameters are set
    if (endpoint && endpoint.length) {
        if (lat && lng) {
            switch (endpoint) {
                case ENDPOINTS.FORECAST:
                    return axios.get(
                        `${API_URL}${ENDPOINTS.FORECAST}?lat=${lat}&lon=${lng}&units=${UNITS}&appid=${APP_ID}`
                    );
                case ENDPOINTS.WEATHER:
                    return axios.get(
                        `${API_URL}${ENDPOINTS.WEATHER}?lat=${lat}&lon=${lng}&units=${UNITS}&appid=${APP_ID}`
                    );
                default:
                    throw new Error();
            }
        }
    }
};
