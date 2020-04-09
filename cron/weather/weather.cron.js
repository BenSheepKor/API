// package to set up cron jobs
const cron = require('node-cron');
const axios = require('../../global/axios/axios.config');
const weatherConfig = require('./weather.config');

// get access at user functions
const userController = require('../../api/controllers/userController');

// get access to the weather model so we can create an instance
const Weather = require('../../api/models/weatherModel');

/**
 * Count to limit the number of weather reports that are stored in the database per cron job. For more details
 * 
 * @see prepareAndSave
 */
const COUNT = 8;

// Array of locations already pinged. If weather data for a location is already existing, do not fire the API again
let LOCATIONS = [];

// Get all users from the database
userController.getUsers().then(users => {
    // empty LOCATIONS array when cron is about to start
    LOCATIONS = [];

    // Loop through users
    users.forEach(user => {
        // default coordinates for Corfu, our main point of interest for alpha
        let lat = weatherConfig.DEFAULT_LOCATION.LAT;
        let lng = weatherConfig.DEFAULT_LOCATION.LNG;

        // if user location is known, change the url coordinates
        if (user.location.lat && user.location.lng) {
            lat = user.location.lat;
            lng = user.location.lng;
        }

        // check that the current user's location has not been pinged for yet. If it has, continue to next user
        if (!checkLocationPinged(lat, lng)) {
            // open weather API request url
            let url = `${weatherConfig.API_URL}forecast?lat=${lat}&lon=${lng}&units=${weatherConfig.UNITS}&appid=${weatherConfig.APP_ID}`;

            // If user location is not known, default to Corfu, which is the "release base" of our software
            // Cron job that runs every 3 hours. Gets a 5 day forecast for every 3 hours for a specific location given by latitude and longtitude
            // 0 */3 * * *
            cron.schedule('0 */3 * * *', async () => {
                /**
                 * Delete data. No prior timestamp data wanted during dev. Might change after alpha
                 * 
                 * @see deleteWeatherData
                 */

                await deleteWeatherData();

                // shot the request to the open weather API
                axios.get(url).then(async res => {
                    // save data
                    const success = await prepareAndSave(res);

                    // use discord bot. Used during dev for debugging purposes
                    notifyDiscordChannel(success, lat, lng);

                })
            });
        }

    })
})

/**
 * Function that receives the open weather api response object and prepares the object to be used by our weather model
 * Throughout development process, to save up on space, we will hold information only for the next 24 hours
 * 
 * The API response is a 5 day 3-hourly forecast Therefore, we will loop only through the first 8 elements: 3x8 = 24 hours
 * 
 * @param {Object} weatherObj
 * 
 * @returns {Boolean} Returns true if all weather objects are saved else throws error 
 */
async function prepareAndSave(weatherObj) {
    const weatherList = weatherObj.list;

    // make sure the list has elements
    if (weatherList.length > 0) {
        // Get data from the open weather API response

        const name = weatherObj.city.name || '';

        const location = {
            lat: weatherObj.city.coord.lat || 0,
            lng: weatherObj.city.coord.lon || 0,
        };

        // Loop through the weather reports. there are 40 reports. 8 reports per day for 5 days
        for (let i = 0; i < COUNT; i++) {
            // get the current report
            const report = weatherList[i];

            // create the weather object
            const weather = new Weather({
                timestamp: report.dt || 0,
                temp: report.main.temp || '',
                description: report.weather[0].description || '',
                location,
                name,
            });
            // successful save to database
            try {
                const success = await weather.save();

                // throw error even if one object is not stored
                if (!success) throw new Error();

            } catch (error) {
                console.log(error)
            }
        }
    }

    // if all data is store return true
    return true;
}

/**
 * Function that sends a message to a discord channel that lets us know the state of the weather cron job
 * 
 * @param {Boolean} success Determined by if all weather data are succesfully stored in the dabase 
 */
function notifyDiscordChannel(success, lat, lng) {
    let content = 'Weather data saved';

    if (!success) {
        content = 'Something went wrong';
    }

    content += ' | Cron executed at ' + new Date() + '\n Coordinates: \n Lat: ' + lat + '\n Lng: ' + lng + '\n =================================';

    const body = { content };

    axios.post('https://discordapp.com/api/webhooks/691348810835820595/TpPlu4t_78e_g4de7r00noLKpBEUbu3fZJS0rP3DzaoXyGYFofGF6qiNb4-_eXc8HsIu', body).then(() => {
        // do nothing
    }).catch(err => {
        // do nothing
        console.log(err)
    });
}

/**
 * Function that deletes all data when the cron job starts. That way, we ensure that there is no weather data for prior times
 * After alpha release this is prone to change
 * @change
 * 
 * @returns {Boolean} Returns true if deletion was successful
 */
async function deleteWeatherData() {
    return Weather.deleteMany({}).then((res, err) => {
        if (err) throw new Error(err);

        return res;
    })
}

/**
 * Function that is used by the weather cron to decide wether it should ping for the current user's location
 * 
 * @param {Number} lat The langitude of the current user's location
 * @param {Number} lng The longtitude of the current user's location
 */

function checkLocationPinged(lat, lng) {
    // LOCATIONS is empty because this is the first user. add location to array and return early

    if (!LOCATIONS.length) {
        LOCATIONS.push({ lat, lng });
        return false;
    }
    // loop over the LOCATIONS array of locations that are already pinged
    if(!LOCATIONS.find(location => location.lat === lat && location.lng === lng)){
        LOCATIONS.push({ lat, lng });
        return false;
    }

    return true;
}
