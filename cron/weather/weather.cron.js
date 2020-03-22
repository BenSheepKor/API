// package to set up cron jobs
const cron = require('node-cron');
const axios = require('../../global/axios/axios.config');
const weatherConfig = require('./weather.config');

// get access at user functions
const userController = require('../../api/controllers/userController');

// Get all users from the database
userController.getUsers().then(users => {
    // Loop through users
    users.forEach(user => {

        // If user location is known, use it for the cron job
        if (user.hasOwnProperty('location')) {
            const { location } = user;

            if (location.lng && location.lat) {
                // Cron job that runs every 3 hours. Gets a 5 day forecast for every 3 hours for a specific location given by latitude and longtitude
                cron.schedule('0 */3 * * *', () => {
                    axios.get(`${weatherConfig.API_URL}forecast?lat=${location.lat}&lon=${location.lng}&units=${weatherConfig.UNITS}&appid=${weatherConfig.APP_ID}`).then(res => {
                        // store it to the database
                    })
                });
            }
        }

        // If user location is not known, default to Corfu, which is the "release base" of our software
        cron.schedule('* * * * *', () => {
            axios.get(`${weatherConfig.API_URL}forecast?lat=39.6243&lon=19.9217&units=${weatherConfig.UNITS}&appid=${weatherConfig.APP_ID}`).then(res => {
                // store it to the database
            })
        });
    })
})
