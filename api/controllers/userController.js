'use strict';

// Get mongoose to connect with the mongodb database
const mongoose = require('mongoose');

// Get the User model 
const User = mongoose.model('User');

// Get bcrypt for password hasing and salt generation
const bcrypt = require("bcrypt");


/**
 * Callback function for GraphQL query "users"
 * 
 * It returns all the users of the database
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
    return User.find({}).then((users) => {
        return users;
    }).catch(err => {
        // do nothing for now. We will implement a global catch error function
    });
}

/**
 * Callback function for GraphQL mutation "register"
 * 
 * Checks email and password validity, duplicate email registries and registers user if all constraints are ok.
 * 
 * @param req The request object of the mutation. For structure of the object, see the GraphQL schema
 * 
 */
exports.create_user = async req => {
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
                return registerUser(email, password).then(
                    user => {
                        // format response so GraphQL can pick it up
                        return {id: user.id , email: user.email};
                    }
                )
            }

            return new Error("DUPLICATE_EMAIL");
        }

        return new Error('INVALID_PASSWORD');
    }

    throw new Error('INVALID_EMAIL');

}

/**
 * Callback function for GraphQL mutation "login"
 * 
 * Checks for registered email and logs in user if password is correct
 * 
 * @param req The request object of the mutation. For structure of the object, see the GraphQL schema
 * 
 */
exports.login = async req => {
    // get email and password  from the database
    const { email, password } = req;

    // make sure user is registered on the platform
    const userDoesExist = await checkUserExists(email);

    if(userDoesExist){
        // Check for the password and get the token if it is correct
        const token = await verifyPassword(email, password);

        // If password compare is true return the token
        if(token) return token;

        // If passwords missmatch throw respective error
        throw new Error("INCORRECT_PASSWORD");
    }

    throw new Error("USER_DOES_NOT_EXIST")
}

/**
 * Function that gets the user email upon registration and checks its validity against a regex
 * Regex taken from https://emailregex.com/. 
 *  
 * @param {string} email 
 * 
 * @returns {boolean} True or false depending on the validity of the email against the regex 
 */
function validateEmail(email) {
    // taken from https://emailregex.com/
    var emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return emailRegex.test(String(email).toLowerCase());
}

/**
 * Function that gets the user password upon registration and checks its validity
 * A password is valid only if it contains at least a number and is longer than 8 characters
 * 
 * @param {string} password 
 * 
 * @returns {boolean} True or false depending on the validity of the password
 */
function validatePassword(password) {
    return password.length > 8 && /\d/.test(password);
}

/**
 * Function that compares the input password of user with the given email with the stored password in the database. If comparison is truthy 
 * it generates and returns a token. If comparison is falsy, it returns false
 * @param {String} email 
 * @param {String} password 
 * 
 * @returns {String | Boolean} Returns a JWT token if passwords are the same. Otherwise, returns false
 */

async function verifyPassword(email, password){
    // Get exactly one user. We know one exists because we have already checked in login function
    return User.findOne({email}).then(user => {
        // compare the input password with the stored password of user object
        const doesMatch =  bcrypt.compareSync(password, user.password);

        // If passwords match generate the JWT token for authentication else return false
        if(doesMatch) return generateToken();

        return doesMatch;
    });
}

/**
 * Function that searches the database for a user email upon registration to check for duplicates. Fires after input validation
 * @param {string} email 
 * 
 * @returns {boolean} True or false depending on the existence of duplicate emails
 */
async function checkUserExists(email) {
    return User.findOne({ email: email }).then((user, error) => {
        if(user) return user;

        return false;
    })
}

/**
 * Function that generates a JWT token for the user after succesffull login
 * @returns {String} Dummy hard coded string for now
 */
function generateToken(){
    return {token: '13asd123asd123sd'};
}

/**
 * Function that persists the newly registered user in the database. Both email and password have already been validated
 * 
 * @param {string} email 
 * @param {string} password 
 * 
 * @returns {number} Returns the id of the user. Throws error in case something goes wrong
 */
async function registerUser(email, password) {

    const id = await generateId();

    // takes about ~80ms
    const salt = await bcrypt.genSalt();

    // hashed password
    password = await bcrypt.hash(password, salt);

    const user = new User({ id, email, password });

    const res = await user.save();

    return res;

}


/**
 * Function that generates the ID for the newly registerd user. MongoDB provides an _id field but it is not readable.
 * Therefore, we are providing our own mechanism for user ids so they can be prettier and more easily readable by a human. (SEO)
 * 
 * The function queries the database fetching results for the lastly inserted user. If they exists, it increments their id by 1 and returns that. Defaults to 1
 * if the user is the first one registed.
 * 
 * @returns {number} The id of the user about to register
 * 
 */
async function generateId() {
    return User.find().sort({ _id: -1 }).limit(1).then(users => {
        if (users.length > 0) {
            return users[0].id + 1;
        }

        return 1;
    })
}