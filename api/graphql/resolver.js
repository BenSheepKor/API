// Use the UserController to get its functions.
const UserController = require('../controllers/userController');

// Root resolver for the GraphQL endpoints' callbacks
const root = {
    users: () => { return UserController.getUsers() },
    me: (args, req) => { return UserController.me(args, req) },
    register: (args) => { return UserController.create_user(args) },
    login: (args) => { return UserController.login(args) },
}

// export the resolver
module.exports = root;