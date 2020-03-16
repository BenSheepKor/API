'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    id: {
        type: Number,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    faculty: {
        type: String,
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