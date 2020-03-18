'use strict';

const errorKeys = require('./errorKeys');

/**
 * Errors will be thrown using keys from a predefined schema. This function will map the keys to their respective message.
 *
 * eg. INVALID_EMAIL will lead to an error message of "Your email is invalid"
 *     DUPLICATE_EMAIL will lead to an error message of "Email already in use"
 *
 *                                       DISCLAIMER
 * 
 * In order for this to work when an error is supposed to be thrown, use throw new Error(ERROR_KEY)
 * eg. throw new Error("INVALID_EMAIL")
 *  
 *                                        DISCLAIMER
 * 
 * 
 * All keys can be found in errorKeys.js @see errorKeys.js
 * 
 * @param error The key of the error
 */
exports.handleError = error => {
    // get message and status code from global error keys
    if (errorKeys.hasOwnProperty(error)) {
        const { message, statusCode } = errorKeys[error];

        // return error description
        return {
            error,
            message,
            statusCode
        }
    }

}