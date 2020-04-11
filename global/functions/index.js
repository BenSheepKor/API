const User = require('../../api/models/userModel');
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
