'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faculty = new Schema({
    name: {
        type: String,
        required: true,
    },
    dean: String,
    city: String,
});

faculty.index({ name: 1, unique: true });

module.exports = mongoose.model('Faculty', faculty);
