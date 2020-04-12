// Include buildSchema from graphql package
const { buildSchema } = require('graphql');

const types = `
type User {
  id: Int!,
  name: String,
  email: String!,
  username: String,
  faculty: String!,
  lat: String,
  lng: String,
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

const queries = `
type Query {
  users: [User]
  me: User
  weather(lat: Float!, lng: Float!): Weather,
  courses(userId: Int!): [Course]
},
`;

const mutations = `
type Mutation {
  register(email: String!, password: String!): User,
  login(email: String, username: String, password: String!): JWT
},`;

// Define the schema. In order to make sense of what is going on please see https://graphql.org/learn/schema/
const schema = buildSchema(`
    ${types}
    ${queries}
    ${mutations}
`);

// export schema
module.exports = schema;
