const config = require('../../config');

const secureRandom = require('secure-random');

const signingKey = secureRandom(256, { type: 'Buffer' }); // Create a highly random byte array of 256 bytes

const claims = {
	iss: config.prod.url,  // The URL of your service
	scope: 'self'
};

module.exports = Object.freeze({
	signingKey,
	claims,
});