// Use the UserController to get its functions.
const UserController = require('../controllers/userController');
const WeatherController = require('../controllers/weatherController.js');
const CourseController = require('../controllers/courseController');

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
        return WeatherController.getWeatherByCityName(args, req);
    },

    // Courses related
    myCourses: (args, req) => {
        return CourseController.get(args, req);
    },
    addCourse: (args, req) => {
        return CourseController.create(args, req);
    },
    deleteCourse: (args, req) => {
        return CourseController.delete(args, req);
    },
};

// export the resolver
module.exports = root;
