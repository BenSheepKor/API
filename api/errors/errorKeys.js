/**
 * STATUS CODES AND WHAT THEY MEAN
 *
 * 409: Data conflict, probable duplication of entries
 * 422: Valid request format, invalid data. Maybe a field is missing or is invalid or there is an unexpected field
 */

// Prevent object modification
module.exports = Object.freeze({
    // Register
    INVALID_EMAIL: {
        message: 'The email address is not valid',
        status: 422,
    },
    DUPLICATE_EMAIL: {
        message: 'This email is already in use',
        status: 409,
    },
    INVALID_PASSWORD: {
        message: 'Password must have at least 8 characters and a number',
        status: 422,
    },
    // Login
    USER_DOES_NOT_EXIST: {
        message: 'We did not find a user mathing the credentials',
        status: 404,
    },
    INCORRECT_PASSWORD: {
        message: 'Password is incorrect',
        status: 401,
    },
    NO_AUTH: {
        message: 'You are not authorized to make this call',
        status: 401,
    },
    DUPLICATE_COURSE: {
        message: 'This course already exists',
        status: 409,
    },
    UKNOWN: {
        message: 'Something went terribly wrong. We are wokring on it',
        status: 500,
    },
});
