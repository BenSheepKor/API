// package to set up cron jobs
const cron = require('node-cron');
const axios = require('axios');
// Run this cron every 3 hours
cron.schedule('0 */3 * * *', function () {
    axios.get('https://api.openweathermap.org/data/2.5/weather?lat=39&lon=19&units=metric&appid=7e8a5e689d1fc015276bf1fdab7bb48d').then(res => {
        console.log(res.data.main.temp + ' degrees in ' + res.data.name)
    })
});