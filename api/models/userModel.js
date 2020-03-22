'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        required: true,
    },
    username:{
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    faculty: {
        type: String,
        default: '',
    },
    joined_at: {
        type: Date,
        default: Date.now
    },
    last_log_in: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
        default: '',
    },
    location: {
        lat: Number,
        lng: Number,
    }
});

// Indexes used for users. 1 means ASC. -1 means DESC
UserSchema.index({id: 1 , email: 1});

module.exports = mongoose.model('User', UserSchema);