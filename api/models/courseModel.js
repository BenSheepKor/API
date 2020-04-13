'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    // user id and not user _id. it references our custom id given to users, simple numerical value
    user_id: { type: Number, ref: 'User', required: true },
    name: {
        type: String,
        required: true,
    },
    semester: {
        type: Number,
        required: false,
    },
    professor: {
        type: String,
        required: false,
    },
    grade: {
        type: Number,
        required: false,
    },
    /**
     * Both start and end will be stored in minutes so we can perform $gte and $lte on mongodb queries
     *
     * ******************** NOTE TO FRONTEND *********************************
     *
     * When handling the schedule selection during creation of a new course, use a javascript date object.
     * From said object, extract:
     *  1. the day: date.getDay()
     *  2. the hours (in minutes): date.getHours() * 60
     *  3. the minutes: date.getMinutes()
     *
     * and format the schedule object as such:
     *  schedule: {
     *      0: {
     *          start: 540 (09:00),
     *          end: 660 (11:00)
     *      },
     *      ...
     * }
     *
     * ******************** NOTE TO FRONTEND *********************************
     */
    schedule: {
        type: Array,
        default: [],
    },
});

// 1 means ASC. -1 means DESC
CourseSchema.index({ user_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Course', CourseSchema);
