// Include buildSchema from graphql package
const { buildSchema } = require('graphql');

const types = `
type User {
  id: Int!,
  name: String,
  email: String!,
  username: String,
  faculty: String!,
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
  addCourse(name: String!, schedule: ScheduleInput!): Course,
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
