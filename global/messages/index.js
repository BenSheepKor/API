/**
 *  A list of string literals to be used globally in order to avoid typos and confusion (and probably wanting to quit developing while debugging)
 */
module.exports = Object.freeze({
    // valid user related data for tests
    TEST_USER_EMAIL: 'test@mocha.com',
    TEST_USER_PASSWORD: 'safepassword123',
    TEST_USERNAME: 'test_mocha',

    // invalid user related data for tests
    TEST_USER_BAD_EMAIL: 'invalidemail.com',
    TEST_USER_BAD_PASSWORD: 'unsafepass',
    TEST_USER_NON_EXISTENT_EMAIL: 'nonexistent@email.com',
    TEST_USER_NON_EXISTENT_USERNAME: 'nonexistentusername',

    TEST_LOCATION: 'Corfu',
    TEST_FACULTY_NAME: 'Ionian University',
    TEST_SUITE_SOURCE: 'TEST',
});
