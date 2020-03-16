// Prevent object modification
module.exports = Object.freeze({
    INVALID_EMAIL: {
        message: 'The email address is not valid',
        statusCode: 400,
    },
    DUPLICATE_EMAIL: {
        message: 'This email is already in use'
    }
})