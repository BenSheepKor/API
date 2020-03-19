var secureRandom = require('secure-random');

var signingKey = secureRandom(256, { type: 'Buffer' }); // Create a highly random byte array of 256 bytes

var claims = {
    iss: "http://116.203.64.13:4000",  // The URL of your service
    scope: "self"
}

module.exports = Object.freeze({
    signingKey,
    claims,
});