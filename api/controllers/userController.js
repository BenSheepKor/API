'use strict';

// Get mongoose to connect with the mongodb database
const mongoose = require('mongoose');

// Get the User model
const User = mongoose.model('User');

// Get bcrypt for password hasing and salt generation
const bcrypt = require('bcrypt');

// JWT package for Node
const nJwt = require('njwt');

// configuration file for JWT
const jwtConfigs = require('../jwt/config.dev');

const { checkForToken, isAuthorized } = require('../../global/functions');

/**
 * Callback function for GraphQL query "users"
 *
 * It returns all the users of the database
 *
 * This endpoint exists only for testing purposes during the development process. It will be removed prior to alpha
 * @remove
 *
 * In order to test this endpoint
 * 1. Go to localhost:4000/graphql (or use this link with Postman or Insomnia)
 * 2. Send the following as a request object
 * query{
 *  users{
 *    username (or any of the valid properties of User defined in the schema @see schema.js)
 *  }
 * }
 *
 *
 */
exports.getUsers = () => {
    // Return users in descending _id order. Last inserted first to show
    return User.find({}, (err, users) => {
        if (err) {
            throw new Error(err);
        }

        return users;
    });
};

/**
 * Callback function for "me" query
 *
 * Authenticates the user using a Bearer token. If token is valid, returns data for the specific user.
 *
 */
exports.me = async (args, req) => {
    const token = checkForToken(req);

    // check that token was set
    if (token) {
        // check user is authorized
        if (await isAuthorized(token)) {
            // use token to get user's data
            return User.findOne({ token }, (err, user) => {
                if (err) {
                    throw new Error(err);
                }

                return user;
            });
        }
    }

    throw new Error('NO_AUTH');
};

/**
 * Callback function for GraphQL mutation "register"
 *
 * Checks email and password validity, duplicate email registries and registers user if all constraints are ok.
 *
 * @param req The request object of the mutation. For structure of the object, see the GraphQL schema
 *
 */
exports.createUser = async (req) => {
    // get email and username from request
    const { email, password } = req;

    // Make sure email is valid else throw error
    if (validateEmail(email)) {
        // Make sure password is valid
        if (validatePassword(password)) {
            // Make sure email is not already registered on the platform
            const userDoesExist = await checkUserExists(email);

            if (!userDoesExist) {
                // Returns the result of saving the user in the database
                return registerUser(email, password)
                    .then((user) => {
                        // format response so GraphQL can pick it up
                        return user;
                    })
                    .catch((err) => {
                        throw new Error(err);
                    });
            }

            return new Error('DUPLICATE_EMAIL');
        }

        return new Error('INVALID_PASSWORD');
    }

    throw new Error('INVALID_EMAIL');
};

/**
 * Callback function for GraphQL mutation "login"
 *
 * A user will be able to login with either email or username
 *
 * Checks for registered user and logs them in if password is correct
 *
 * @param req The request object of the mutation. For structure of the object, see the GraphQL schema
 *
 */
exports.login = async (req) => {
    // extract variables
    const { email, username, password } = req;

    // Make sure a password is sent
    if (password) {
        let token,
            userDoesExist,
            isUsername = false;

        // user wants to login using email address
        if (!username && email !== '') {
            // sent email exists in the database
            userDoesExist = await checkUserExists(email);
        }

        // user wants to login using username
        if (!email && username !== '') {
            // sent username exists in the database
            userDoesExist = await checkUserExists(username, true);
            isUsername = true;
        }

        // continue if user exists
        if (userDoesExist) {
            // Check for the password and get the token if it is correct
            if (isUsername) {
                token = await verifyPassword(username, password, true);
            } else {
                token = await verifyPassword(email, password);
            }

            // If password compare is true store the token in the database and return the token to the client
            if (token) {
                // userDoesExist is a User document at this point
                const user = userDoesExist;
                storeToken(user.id, token.token);

                return token;
            }

            // If passwords missmatch throw respective error
            throw new Error('INCORRECT_PASSWORD');
        }

        throw new Error('USER_DOES_NOT_EXIST');
    }

    throw new Error('INCORRECT_PASSWORD');
};

/**
 * Function that gets the user email upon registration and checks its validity against a regex
 * Regex taken from https://emailregex.com/.
 *
 * @param {String} email
 *
 * @returns {Boolean} True or false depending on the validity of the email against the regex
 */
function validateEmail(email) {
    // taken from https://emailregex.com/
    const emailRegex = /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return emailRegex.test(String(email).toLowerCase());
}

/**
 * Function that gets the user password upon registration and checks its validity
 * A password is valid only if it contains at least a number and is longer than 8 characters
 *
 * @param {String} password
 *
 * @returns {Boolean} True or false depending on the validity of the password
 */
function validatePassword(password) {
    return password.length > 8 && /\d/.test(password);
}

/**
 * Function that compares the input password of user with the given email with the stored password in the database. If comparison is truthy
 * it generates and returns a token. If comparison is falsy, it returns false
 * @param {String} checkValue It can be either an email or a username. Determined by isUsername parameter
 * @param {String} password The sent password
 * @param {Boolean} isUsername Boolean value that determines whether to search by email or username. Defaults to false, so user is filtered by email
 *
 * @returns {String | Boolean} Returns a JWT token if passwords are the same. Otherwise, returns false
 */

function verifyPassword(checkValue, password, isUsername = false) {
    const filterObj = {};

    if (isUsername) {
        Object.assign(filterObj, { username: checkValue });
    } else {
        Object.assign(filterObj, { email: checkValue });
    }
    // Get exactly one user. We know one exists because we have already checked in login function
    return User.findOne(filterObj).then((user) => {
        // compare the input password with the stored password of user object
        const doesMatch = bcrypt.compareSync(password, user.password);

        // If passwords match generate the JWT token for authentication else return false
        if (doesMatch) {
            return generateToken();
        }

        return doesMatch;
    });
}

/**
 * Function that searches the database for a user email or username upon registration and login to check for duplicates. Fires after input validation
 * @param {String} checkValue It can be either an email or a username. Determined by isUsername parameter
 * @param {Boolean} isUsername Boolean value that determines whether to search by email or username. Defaults to false, so user is filtered by email
 *
 * @returns {User | Boolean} User object or false depending on the existence of duplicate emails
 */
function checkUserExists(checkValue, isUsername = false) {
    const filterObj = {};

    if (isUsername) {
        Object.assign(filterObj, { username: checkValue });
    } else {
        Object.assign(filterObj, { email: checkValue });
    }

    return User.findOne(filterObj).then((user, error) => {
        if (error) {
            throw new Error(error);
        }

        if (user) {
            return user;
        }

        return false;
    });
}

/**
 * Function that generates a JWT token for the user after succesffull login
 * @returns {String} Dummy hard coded string for now
 */
function generateToken() {
    const jwt = nJwt.create(jwtConfigs.claims, jwtConfigs.signingKey);

    // The token that the client receives
    const token = jwt.compact();

    return { token };
}

function storeToken(userId, token) {
    return User.findOneAndUpdate({ id: userId }, { token }, (err) => {
        if (err) {
            throw new Error(err);
        }

        return true;
    });
}

/**
 * Function that persists the newly registered user in the database. Both email and password have already been validated
 *
 * @param {String} email
 * @param {String} password
 *
 * @returns {Number} Returns the id of the user. Throws error in case something goes wrong
 */
async function registerUser(email, password) {
    const id = await generateId();

    // takes about ~80ms
    const salt = await bcrypt.genSalt();

    // hashed password
    password = await bcrypt.hash(password, salt);
    // does not add lat and lng if they are null
    const user = new User({ id, email, password });

    return user.save();
}

/**
 * Function that generates the ID for the newly registerd user. MongoDB provides an _id field but it is not readable.
 * Therefore, we are providing our own mechanism for user ids so they can be prettier and more easily readable by a human. (SEO)
 *
 * The function queries the database fetching results for the lastly inserted user. If they exists, it increments their id by 1 and returns that. Defaults to 1
 * if the user is the first one registed.
 *
 * @returns {Number} The id of the user about to register
 *
 */
function generateId() {
    return User.find()
        .sort({ _id: -1 })
        .limit(1)
        .then((users) => {
            if (users.length) {
                return users[0].id + 1;
            }

            return 1;
        });
}
