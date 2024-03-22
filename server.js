//env
require('dotenv').config()
const environment = process.env.NODE_ENV || 'development'

//library imports
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const passport = require('passport')
const session = require('express-session')
const DiscordStrategy = require('passport-discord').Strategy

//Model Import
const User = require('./models/user')

//route imports
const userRouter = require('./routes/user')
const characterRouter = require('./routes/character')
const scoreableObjectRouter = require('./routes/scoreableObject')
const leagueRouter = require('./routes/league')
const teamRouter = require('./routes/team')
const scoringEventRouter = require('./routes/scoringEvent')
const dashboardDataRouter = require('./routes/dashboardData')

//bind models to db
const Knex = require('knex')
const knexfile = require('./knexfile')
const { Model, knexSnakeCaseMappers } = require('objection')
const knex = Knex({
  ...knexfile[process.env.ENVIRONMENT],
  ...knexSnakeCaseMappers()
})
Model.knex(knex)

//initiate
const app = express()
app.use(bodyParser.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // specify the exact origin
    credentials: true // allow credentials
  })
)
console.log('yo freney, we got some envs, port, FE URL')
console.log(process.env.PORT)
console.log(process.env.FRONTEND_URL)
console.log(process.env.AZURE_POSTGRESQL_9DBA8_DATABASE)

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Important for security
      secure: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax'
    }
  })
)

app.use(passport.initialize())
app.use(passport.session())

// auth
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'email']
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await User.query().findOne({ username: profile.username })
        if (!user) {
          user = await User.query().insert({
            username: profile.username,
            role: 'player' // default role
            // add other fields as necessary
          })
        }
        console.log(user)

        done(null, user)
      } catch (err) {
        done(err)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.query()
    .findById(id)
    .then(user => {
      done(null, user)
    })
    .catch(err => {
      done(err)
    })
})

app.get('/auth/discord', passport.authenticate('discord'))

app.get(
  '/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect(`${process.env.FRONTEND_URL}/`)
  }
)

function ensureAuthenticated (req, res, next) {
  console.log('in the ensureAuth loop')
  if (req.isAuthenticated()) {
    return next()
  } else {
    // Redirect unauthenticated users to the login page
    res.redirect('/login')
  }
}

function ensureRole (role) {
  return function (req, res, next) {
    if (req.user && req.user.role === role) {
      return next()
    } else {
      // Redirect users without the required role to the home page
      res.redirect('/')
    }
  }
}

app.get('/auth/check', (req, res) => {
  console.log('authing someone')
  if (req.isAuthenticated()) {
    res.send(true)
  } else {
    console.log('not authed')
    res.send(false)
  }
})
//create a route that takes the session
//and returns the user's role, their team id and their userId
app.get('/user', (req, res) => {
  console.log(req.session)
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin' || req.user.role === 'team_leader') {
      req.user.isTeamLeader = true
    }
    res.send(req.user)
  } else {
    //return a 401
    res.status(401).send('You are not authenticated')
  }
})

//handle logout
app.get('/auth/logout', (req, res) => {
  req.logout()
  res.send({ success: true })
})

// middlwear
app.get(
  '/admin',
  ensureAuthenticated,
  ensureRole('admin'),
  function (req, res) {
    // Only authenticated users with the 'admin' role can access this route
    res.send('Welcome, admin!')
  }
)

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

//import routres
app.use('/users', userRouter)
app.use('/characters', characterRouter)
app.use('/scoreable-objects', scoreableObjectRouter)
// app.use('/score-events', scoreRouter)
app.use('/leagues', leagueRouter)
app.use('/teams', teamRouter)
app.use('/scoring-events', scoringEventRouter)
app.use('/dashboard-data', dashboardDataRouter)

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(err.status || 500)
  res.json({ error: err.message })
  console.log(err)
})
// Start the server
const PORT = process.env.PORT || 8001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
