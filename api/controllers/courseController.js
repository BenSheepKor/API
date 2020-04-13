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

            // check that course has not been registered for specific user
            const course = await this.checkUserHasCourse(id, name);

            // create if course has not been registered
            if (!course) {
                const newCourse = new Course({ user_id: id, name, schedule });

                await newCourse.save();

                return newCourse;
            }

            course.name = name;
            course.schedule = [...course.schedule, schedule];

            await course.save();
            return course;
        }
    }

    throw new Error('NO_AUTH');
};

module.exports.checkUserHasCourse = (userId, courseName) => {
    if (userId && courseName) {
        return Course.findOne(
            { user_id: userId, name: courseName },
            (err, course) => {
                if (err) {
                    throw new Error(err);
                }

                return course;
            }
        );
    }
};
