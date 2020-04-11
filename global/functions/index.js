/**
 * Function that checks for a Bearer token in the request and optioanlly returns said token
 *
 * @param {Object} req The request object
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
