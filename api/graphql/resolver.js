// Use the UserController to get its functions.
const UserController = require('../controllers/userController');
const WeatherController = require('../controllers/weatherController.js');

// Root resolver for the GraphQL endpoints' callbacks
const root = {
    // User related
    users: () => {
        return UserController.getUsers();
    },
    me: (args, req) => {
        return UserController.me(args, req);
    },
    register: (args) => {
        return UserController.createUser(args);
    },
    login: (args) => {
        return UserController.login(args);
    },

    // Weather related
    weather: (args, req) => {
        return WeatherController.getWeatherByCoordinates(args, req);
    },
};

// export the resolver
module.exports = root;
