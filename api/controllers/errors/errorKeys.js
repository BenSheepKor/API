/**
 * STATUS CODES AND WHAT THEY MEAN
 * 
 * 409: Data conflict, probable duplication of entries
 * 422: Valid request format, invalid data. Maybe a field is missing or is invalid or there is an unexpected field
 */

// Prevent object modification
module.exports = Object.freeze({
    INVALID_EMAIL: {
        message: 'The email address is not valid',
        statusCode: 422,
    },
    DUPLICATE_EMAIL: {
        message: 'This email is already in use',
        statusCode: 409,
    },
    INVALID_PASSWORD: {
        message: 'Password must have at least 8 characters and a number',
        statusCode: 422,
    },
    UKNOWN: {
        message: 'Something went terribly wrong. We are wokring on it',
        statusCode: 500
    }
})