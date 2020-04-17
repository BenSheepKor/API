// Require express to develop the API
const express = require('express'),
    // Make this application and express instance
    app = express(),
    // Use the port defined in "options" if exists, else on port 4000
    port = process.env.PORT || 4000,
    // Use mongoose to connect and interact with mongodb
    mongoose = require('mongoose'),
    // cors
    cors = require('cors'),
    // Register the model
    // eslint-disable-next-line no-unused-vars
    User = require('./api/models/userModel');

// Cron job to get the weather information
require('./cron/weather/weather.cron');

app.use(cors());
app.options('*', cors()); // include before other routes

// Deprecation warnings fix and mongo configs
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost/BenSheep', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const expressGraphQL = require('express-graphql');

// GraphQL schema
const schema = require('./api/graphql/schema');

// Root resolver
const root = require('./api/graphql/resolver');

const errorController = require('./api/errors/errorController');

// Use graphql for the API
app.use(
    '/graphql',
    expressGraphQL({
        // register the schema
        schema: schema,
        // register the resolver
        rootValue: root,
        // register custom function to handle errors
        customFormatErrorFn: (error) => {
            return errorController.handleError(error.message);
        },
        // enable the GUI tool for endpoint testing
        graphiql: true,
    })
);

// register routes
const routes = require('./api/routes/all_routes');
routes(app);

// Make app listen to the port
app.listen(port, () => console.log('PugSheep API init on:' + port));
