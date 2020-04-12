'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
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
    username: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    joined_at: {
        type: Date,
        default: Date.now,
    },
    last_log_in: {
        type: Date,
        default: Date.now,
    },
    token: {
        type: String,
        default: '',
    },
    faculty_id: {
        type: Schema.Types.ObjectId,
        ref: 'Faculty',
    },
});

// Indexes used for users. 1 means ASC. -1 means DESC
UserSchema.index({ id: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema);
