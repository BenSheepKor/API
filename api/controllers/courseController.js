'use strict';

const Course = require('../models/courseModel');
const { checkForToken, getUserIdByToken } = require('../../global/functions');

/**
 * Callback function for courses query. Returns all user's courses after authentication
 */
module.exports.get = async (args, req) => {
    // check for auth token
    const token = checkForToken(req);

    if (token) {
        // get user id from query arguments
        const { id } = await getUserIdByToken(token);
        if (id) {
            return Course.find({ user_id: id }, (err, res) => {
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

/**
 * Callback function for addCourse.
 */
module.exports.create = async (args, req) => {
    const token = checkForToken(req);

    if (token) {
        const { name, schedule, semester, grade, professor } = args;

        if (name && schedule) {
            const { id } = await getUserIdByToken(token);

            // check that course has not been registered for specific user
            const course = await checkUserHasCourse(id, name);

            // create if course has not been registered
            if (!course) {
                const newCourse = new Course({
                    user_id: id,
                    name,
                    schedule,
                    semester,
                    grade,
                    professor,
                });

                await newCourse.save();

                return newCourse;
            }

            throw new Error('DUPLICATE_COURSE');
        }
    }

    throw new Error('NO_AUTH');
};

/**
 * Callback function for updateCourse
 */

module.exports.update = async (args, req) => {
    const token = checkForToken(req);

    if (token) {
        const { name } = args;

        if (name) {
            const { id } = await getUserIdByToken(token);
            const course = await checkUserHasCourse(id, name);

            if (course) {
                const { name, schedule, semester, grade, professor } = args;

                const updatedCourse = await updateCourse(
                    course,
                    name,
                    schedule,
                    grade,
                    semester,
                    professor
                );

                return updatedCourse;
            }

            throw new Error('COURSE_DOES_NOT_EXIST');
        }
    }

    throw new Error('NO_AUTH');
};

/**
 * Callback function for delete course
 */

module.exports.delete = async (args, req) => {
    const token = checkForToken(req);

    if (token) {
        const { name } = args;

        if (name) {
            const { id } = await getUserIdByToken(token);

            await Course.deleteOne({ user_id: id, name });

            return true;
        }
    }

    throw new Error('NO_AUTH');
};

const checkUserHasCourse = (userId, courseName) => {
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

const updateCourse = async (
    course,
    name,
    schedule,
    grade,
    semester,
    professor
) => {
    course.name = name;
    course.schedule = [...course.schedule, schedule];
    course.grade = grade || course.grade;
    course.semester = semester || course.semester;
    course.professor = professor || course.professor;

    try {
        await course.save();
        return course;
    } catch (e) {
        throw new Error(e);
    }
};
