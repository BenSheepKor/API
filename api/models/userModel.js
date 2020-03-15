'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    id: {
        type: Number,
        required: '',
    },
    name: {
        type: String,
        required: '',
    },
    email: {
        type: String,
        required: '',
    },
    password: {
        type: String,
        required: '',
    },
    faculty: {
        type: String,
        required: '',
    },
    joined_at: {
        type: Date,
        default: Date.now
    },
    last_log_in: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);