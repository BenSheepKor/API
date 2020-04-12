'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./userModel');

const CourseSchema = new Schema({
    // user id and not user _id. it references our custom id given to users, simple numerical value
    user_id: { type: Number, ref: User, required: true },
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
    schedule: {
        days: {
            type: Array,
        },
        time: {
            day: {
                type: String,
            },
            start: {
                type: Number,
            },
            end: {
                type: Number,
            },
        },
    },
    required: false,
});

// 1 means ASC. -1 means DESC
CourseSchema.index({ name: 1 });

module.exports = mongoose.model('Course', CourseSchema);
