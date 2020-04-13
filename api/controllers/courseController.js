'use strict';

const Course = require('../models/courseModel');
const { checkForToken, getUserIdByToken } = require('../../global/functions');

module.exports.get = (args, req) => {
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

module.exports.create = async (args, req) => {
    const token = checkForToken(req);

    if (token) {
        const { name, schedule } = args;

        if (name && schedule) {
            const { id } = await getUserIdByToken(token);

            const course = new Course({ user_id: id, name, schedule });

            await course.save();

            return course;
        }
    }

    throw new Error('NO_AUTH');
};
