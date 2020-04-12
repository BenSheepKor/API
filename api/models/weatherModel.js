'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weatherSchema = new Schema({
    temp: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    city: String,
    location: {
        lng: {
            type: Number,
            required: false,
        },
        lat: {
            type: Number,
            required: false,
        },
        required: false,
    },
    timestamp: {
        type: Number,
        required: true,
    },
});

weatherSchema.index({ timestamp: 1, city: 1 });

module.exports = mongoose.model('Weather', weatherSchema);
