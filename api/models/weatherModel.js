'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weatherSchema = new Schema({
    temp: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    city: String,
    location: {
        lng: {
            type: Number,
            required: true,
        },
        lat: {
            type: Number,
            required: true,
        },
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

weatherSchema.index({ timestamp: 1, location: 1 });

module.exports = mongoose.model('Weather', weatherSchema);
