// Use the UserController to get its functions.
UserController = require('../controllers/userController');

// Root resolver for the GraphQL endpoints' callbacks
const root = {
    users: UserController.getUsers(),
    register: (args, res) => { return UserController.create_user(args, res) },
}

// export the resolver
module.exports = root;