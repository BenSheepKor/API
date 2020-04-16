# What is this :man_shrugging: ?

In this repository lies the Express-GraphQL API that will be used by the BenSheepKor organization (which consists of [Mr. Kormenidis Charalampos](https://github.com/hariskor), [Mr. Provatas Dimitris](https://github.com/Dimitris-Provatas) and [Mr. Pagakis Dimosthenis](https://github.com/DimosPagakis)). This API is to be used through the front-end, the code of which can be found at [this here link](https://github.com/BenSheep/React-Client)

# Who is this for :woman_student: :man_student: ?

This project serves two purposes. Firstly, it is a great way for us to learn the MERN stack while at the same time attempt to help out fellow university students. For alpha and early public versions the project will be available for use solely for university students based in Corfu attending the Ionian University, regardless of the faculty. Extendabilty was, of course, thought for during development. If any other university students from other universities and through varying cities throughout the country (and why stop at Greece) would like to use our application, we will do our best to satisfy your needs. Please, kindly remember, that this is a side project we work on after our "day job" is over so our response might not be as immediate as one would wish

# API :electric_plug:

The API is built using GraphQL, so in reality there are no endpointS but just a single endpoint

#### Dev server :computer:

`http://116.203.64.13:4000//graphql`

Through that endpoint devs can access a number of queries and mutations that CRUD data.

# Data :file_cabinet:

## Types

### User type :woman: :man:

```
type User {
  id: Int!, // The customly assigned id of the user (not the MongoDB ObjectId)
  name: String,
  email: String!,
  username: String,
  faculty_id: String!, // The objectId of the university student attends
}
```

### JWT token :key:

```
type JWT {
  token: String! // used after login, more on that in a sec
}
```

### Weather type :sunny: :cloud: :cloud_with_rain: :snowflake: :rainbow:

```
type Weather {
  temp: Float!,
  name: String,
  description: String,
  city: String,
  lat: Float,
  lng: Float,
  timestamp: Int
}
```

### Course type :notebook_with_decorative_cover: :books:

```
type Course {
  name: String!,
  schedule: [CourseSchedule],
  professor: String,
  semester: Int,
  grade: Float,
}
```

#### Course schedule :books: :calendar:

```
type CourseSchedule{
  day: Int!,
  start: Int!,
  end: Int!,
}
```

# Queries :eyes:

```
// retrieves all users, only used during dev. Will be removed before alpha release
users: [User]

me: User // retrieves user information. Requires authentication

weather(city: String!): Weather // retrieves the current weather. Requires authentication

myCourses: [Course] // Retrieves courses associated with a user. Requires authentication
```

# Mutations :pencil:

```
// sign up with email and password
register(email: String!, password: String!): User

// login with password and either email or username
login(email: String, username: String, password: String!): JWT

// updates user information. Requires authentication
newMe(username: String, password: String, facultyId: String): User

// Requires authentication
addCourse(name: String!, schedule: ScheduleInput, semester: Int, grade: Float, professor: String): Course

// Requires authentication
updateCourse(name: String!, schedule: ScheduleInput, semester: Int, grade: Float, professor: String): Course

 // Requires authentication
deleteCourse(name: String!): Boolean
```

# Authentication :lock: :unlock:

After successfully loging in a user receives a JWT token. This token must be stored in the front end application state and sent with the API request, where that is required, as a Bearer Token

`Authorization: Bearer <token>`

# To fellow developers and designers :eyes: :woman_technologist: :man_technologist: :woman_artist: :man_artist:

Are you a web developer (front, back or full-stack) and you want to contribute? Reach out to any of the members and we will contact a short and, trust us, friendly interview, to best verify if both parties will merit. Same applies for UI/UX designers and really, anybody whou would like to get involved
