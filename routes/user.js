const express = require('express')
const router = express.Router()
const User = require('../models/user')

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.query()
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get user by ID
router.get('/:id', getUser, (req, res) => {
  res.json(res.user)
})

// Create user
//check if the user is 'freney' or 'beachy' and give them admin roles
router.post('/', async (req, res) => {
  if (req.body.username === 'freney' || req.body.username === 'beachy') {
    req.body.role = 'admin'
  } else {
    req.body.role = 'player'
  }
  try {
    const newUser = await User.query().insert(req.body)
    res.status(201).json(newUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

//assign team to user by user id and team id
router.post('/:id/assign_team', getUser, async (req, res) => {
  try {
    const updatedUser = await res.user
      .$query()
      .patch({ team_id: req.body.team_id })
    res.json(updatedUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})
// Update user
router.patch('/:id', getUser, async (req, res) => {
  console.log('trying to update a user')
  //check if the team ID changed, if it did, go through each of the scoreevents and update them to the new Team ID
  const oldUser = await User.query().findById(req.params.id)
  if (oldUser.team_id !== req.body.team_id) {
    const scoringEvents = await oldUser.$relatedQuery('scoringEvents')
    for (const event of scoringEvents) {
      await event.$query().patch({ team_id: req.body.team_id })
    }
  }
  try {
    const updatedUser = await res.user.$query().patch(req.body)
    res.json(updatedUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete user
router.delete('/:id', getUser, async (req, res) => {
  //delete all score events attached to that user
  const scoringEvents = await res.user.$relatedQuery('scoringEvents')
  for (const event of scoringEvents) {
    await event.$query().delete()
  }

  try {
    await res.user.$query().delete()
    res.json({ message: 'Deleted User' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Middleware function for getting user by ID
async function getUser (req, res, next) {
  console.log('tried to get user')
  let user
  try {
    user = await User.query().findById(req.params.id)
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.user = user
  next()
}

//get user by team id
router.get('/team/:team_id', async (req, res) => {
  try {
    const users = await User.query().where('team_id', req.params.team_id)
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//get users with Scores

// router.get('/scores', async (req, res) => {
//   try {
//     const users = await User.query()
//     res.json(users)
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// });

module.exports = router
