const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost/BenSheep', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// models
const User = require('./api/models/userModel');
const Course = require('./api/models/courseModel');
const Faculty = require('./api/models/facultyModel');
const Location = require('./api/models/locationModel');
const Weather = require('./api/models/weatherModel');

const { fetchWeatherData, saveWeatherData } = require('./global/functions');

// emojis
const flame = String.fromCodePoint(0x1f525);
const write = String.fromCodePoint(0x1f4c4);
const wine = String.fromCodePoint(0x1f377);

console.log('==================================\n\n');
console.log(`${flame} \t Starting db-purge \t ${flame} \n\n`);

User.deleteMany({}, (err) => {
    if (err) {
        throw new Error(err);
    }

    console.log('==================================\n');
    console.log('Users removed\n');

    Course.deleteMany({}, (err) => {
        if (err) {
            throw new Error(err);
        }

        console.log('==================================\n');
        console.log('Courses removed\n');

        Faculty.deleteMany({}, (err) => {
            if (err) {
                throw new Error(err);
            }

            console.log('==================================\n');
            console.log('Faculties removed\n');

            Location.deleteMany({}, (err) => {
                if (err) {
                    throw new Error(err);
                }

                console.log('==================================\n');
                console.log('Locations removed\n');
            });

            Weather.deleteMany({}, (err) => {
                if (err) {
                    throw new Error(err);
                }

                console.log('==================================\n');
                console.log('Weather data removed\n\n');
                console.log('==================================\n\n');
                console.log(`${write} \t Starting db-seed \t${write} \n\n`);
            });

            User.insertMany(users, (err, insertedUsers) => {
                if (err) {
                    throw new Error(err);
                }

                if (users.length === insertedUsers.length) {
                    console.log('==================================\n');
                    console.log('Users added \n');

                    Course.insertMany(courses, (err, insertedCourses) => {
                        if (err) {
                            throw new Error(err);
                        }

                        if (courses.length === insertedCourses.length) {
                            console.log('==================================\n');
                            console.log('Courses added \n');

                            Faculty.insertMany(
                                faculties,
                                (err, insertedFaculties) => {
                                    if (err) {
                                        throw new Error(err);
                                    }

                                    if (
                                        faculties.length ===
                                        insertedFaculties.length
                                    ) {
                                        console.log(
                                            '==================================\n'
                                        );
                                        console.log('Faculties added \n');

                                        Location.insertMany(
                                            locations,
                                            (err, insertedLocations) => {
                                                if (err) {
                                                    throw new Error(err);
                                                }

                                                if (
                                                    locations.length ===
                                                    insertedLocations.length
                                                ) {
                                                    console.log(
                                                        '==================================\n'
                                                    );
                                                    console.log(
                                                        'Locations added \n'
                                                    );

                                                    fetchWeatherData(
                                                        'forecast',
                                                        'Corfu'
                                                    )
                                                        .then(async (res) => {
                                                            await saveWeatherData(
                                                                res
                                                            );
                                                            console.log(
                                                                '==================================\n'
                                                            );
                                                            console.log(
                                                                'Weather data added \n'
                                                            );

                                                            console.log(
                                                                '==================================\n\n'
                                                            );
                                                            console.log(
                                                                `${wine} \t Delete and seed succeeded.\n${wine} \t Gracefully exiting \n\n`
                                                            );
                                                            console.log(
                                                                '==================================\n\n'
                                                            );

                                                            process.exit(0);
                                                        })
                                                        .catch((err) => {
                                                            throw new Error(
                                                                err
                                                            );
                                                        });
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    });
                }
            });
        });
    });
});

const users = [
    {
        id: 1,
        email: 'user@email.com',
        password: 'safepass123',
        username: 'test_user',
    },
    {
        id: 2,
        email: 'johndoe@email.com',
        password: 'safepass123',
        username: 'JohnDoe',
    },
];

const courses = [
    {
        user_id: 1,
        name: 'Networks',
        semester: 3,
        grade: 9,
    },
    {
        user_id: 2,
        name: 'French  translation',
        semester: 1,
        schedule: [
            {
                day: 3,
                start: 520,
                end: 660,
            },
        ],
    },
];

const faculties = [
    {
        name: 'Ionian University',
        city: 'Corfu',
    },
    {
        name: 'Aristotle University',
        city: 'Thessaloniki',
    },
];

const locations = [
    {
        name: 'Corfu',
    },
    {
        name: 'Thessaloniki',
    },
];
