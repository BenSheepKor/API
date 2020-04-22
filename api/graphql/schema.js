// Include buildSchema from graphql package
const { buildSchema } = require('graphql');

const types = `
type User {
  id: Int!,
  name: String,
  email: String!,
  username: String,
  faculty_id: String!,
},
type JWT {
  token: String!
},
type Weather {
  temp: Float!,
  name: String,
  description: String,
  city: String,
  lat: Float,
  lng: Float,
  timestamp: Int
},
type Course {
  _id: String,
  name: String!,
  schedule: [CourseSchedule],
  professor: String,
  semester: Int,
  grade: Float,
},
type CourseSchedule{
  day: Int!,
  start: Int!,
  end: Int!,
}`;

const inputs = `
  input ScheduleInput {
    day: Int!,
    start: Int!,
    end: Int!,
  }`;

const queries = `
type Query {
  users: [User]
  me: User
  weather(city: String!): Weather,
  myCourses: [Course]
},
`;

const mutations = `
type Mutation {
  register(email: String!, password: String!): User,
  login(email: String, username: String, password: String!): JWT,
  newMe(username: String, password: String, facultyId: String): User,
  addCourse(name: String!, schedule: ScheduleInput, semester: Int, grade: Float, professor: String): Course,
  updateCourse(name: String!, schedule: ScheduleInput, semester: Int, grade: Float, professor: String): Course,
  deleteCourse(name: String!): Boolean
},`;

// Define the schema. In order to make sense of what is going on please see https://graphql.org/learn/schema/
const schema = buildSchema(`
    ${inputs},
    ${types}
    ${queries}
    ${mutations}
`);

// export schema
module.exports = schema;
