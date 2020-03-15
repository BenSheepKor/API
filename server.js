// Require express to develope the API
var express = require('express'),
// Make this application and express insance
  app = express(),
// Use the port defined in "options" if exists, else on port 4000
  port = process.env.PORT || 4000,
// Use mongoose to connect and interact with mongodb
  mongoose = require('mongoose'),
// Register the model
  User = require('./api/models/userModel');

var express_graphql = require('express-graphql');

// GraphQL schema
var schema = require('./api/graphql/schema');

// Root resolver
var root = require('./api/graphql/resolver');

// Use graphql for the API
app.use('/graphql', express_graphql({
  // register the schema
  schema: schema,
  // register the resolver
  rootValue: root,
  // enable the GUI tool for endpoint testing
  graphiql: true
}));

// legacy code that may or may not be needed
mongoose.Promise = global.Promise;

// connect to the database
mongoose.connect('mongodb://localhost/BenSheep');

// register routes
var routes = require('./api/routes/all_routes');
routes(app);

// Make app listen to the port
app.listen(port, () => console.log('PugSheep API init on:' + port));
