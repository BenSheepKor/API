'use strict';

// Get mongoose to connect with the mongodb database.
const mongoose = require('mongoose');

// Get the User model 
const User = mongoose.model('User');

/**
 * Callback function for GraphQL query "users"
 * 
 * It returns all the users of the database.
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
exports.getUsers = () =>  {
    // Return users in descending _id order. Last inserted first to show
    return User.find({}).sort({ _id: -1 }).then((users) => {
        return users;
    }).catch(err => {
        // do nothing for now. We will implement a global catch error function.
    });
}

/**
 * Callback function for GraphQL mutation "createUser"
 * 
 * Simply returns the mutation's parameters for now.
 * 
 * @param req The request object of the mutation. For structure of the object, see the GraphQL schema
 * 
 */
exports.create_user = req => {
    // Just return the req for now. Will implement functionality later.
    return req;
    
}