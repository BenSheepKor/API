// Use the UserController to get its functions.
UserController = require('../controllers/userController');

// Root resolver for the GraphQL endpoints' callbacks
const root = {
    users: UserController.getUsers(),
    createUser: (args) => { return UserController.create_user(args) },
}

// export the resolver
module.exports = root;