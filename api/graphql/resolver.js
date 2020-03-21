// Use the UserController to get its functions.
UserController = require('../controllers/userController');

// Root resolver for the GraphQL endpoints' callbacks
const root = {
    users: () => { return UserController.getUsers()},
    register: (args) => { return UserController.create_user(args) },
    login: (args) => { return UserController.login(args)},
}

// export the resolver
module.exports = root;