'use strict';

const Course = require('../models/courseModel');
const { checkForToken } = require('../../global/functions');

module.exports.courses = (args, req) => {
    // check for auth token
    const token = checkForToken(req);

    if (token) {
        // get user id from query arguments
        const { userId } = args;

        if (userId) {
            return Course.find({ user_id: userId }, (err, res) => {
                if (err) {
                    throw new Error();
                }

                if (res) {
                    return res;
                }
            });
        }
    }

    throw new Error('NO_AUTH');
};
