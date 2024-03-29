const express = require('express')
const router = express.Router()
const ScoringEvent = require('../models/scoringEvent.js')
const ScoreableObject = require('../models/scoreableObject.js')
const User = require('../models/user.js')
const Team = require('../models/team.js')

// Get all scoringEvents
router.get('/', async (req, res) => {
  try {
    const scoringEvents = await ScoringEvent.query().withGraphFetched(
      '[scoreableObject,league, user, team]'
    )
    res.json(scoringEvents)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get scoringEvent by ID
router.get('/:id', getScoringEvent, (req, res) => {
  res.json(res.scoringEvent)
})

// Create scoringEvent
router.post('/', async (req, res) => {
  if (req.body.scoreable_object_id === null) {
    return res.status(400).json({ message: 'Scoreable Object ID is required' })
  }
  //when trying to make an event, check the scoreable object type
  // if the scoreable object's type is not league_bounty or team_bounty
  // then make sure it has a user_id
  // if it doesn't, return a 400
  // if it is one of those types, check that it has team_id
  // if it doesnt return a 400

  // make sure that there isn't already a scoring event for that scoreable object

  const scoreableObject = await ScoreableObject.query().findById(
    req.body.scoreable_object_id
  )
  if (!scoreableObject) {
    return res.status(400).json({ message: 'Scoreable Object does not exist' })
  }
  let user, team
  try {
    if (req.body.user_id) {
      user = await User.query().findById(req.body.user_id)
    } else {
      throw new Error('No user_id provided')
    }

    if (req.body.team_id) {
      team = await Team.query().findById(req.body.team_id)
    } else {
      throw new Error('No team_id provided')
    }

    // Proceed with your logic, now that user and team are defined
    // ...
  } catch (error) {
    // Handle the error, which could be due to missing IDs or a database issue
    res.status(400).json({ error: error.message })
  }
  if (
    scoreableObject.submittableType !== 'league_bounty' &&
    scoreableObject.submittableType !== 'team_bounty'
  ) {
    if (req.body.user_id === null) {
      return res
        .status(400)
        .json({ message: 'User ID is required for this type of scoring event' })
    }
  }
  if (
    scoreableObject.submittableType === 'league_bounty' ||
    scoreableObject.submittableType === 'team_bounty'
  ) {
    if (req.body.team_id === null) {
      return res
        .status(400)
        .json({ message: 'Team ID is required for this type of scoring event' })
    }
  }
  //if its a player bounty, check that the player doesnt already have a bounty by this scoreable object
  if (scoreableObject.submittableType === 'account_objective') {
    const scoringEvents = await ScoringEvent.query().where(
      'user_id',
      req.body.user_id
    )
    const existingBounty = scoringEvents.find(
      event => event.scoreableObjectId === req.body.scoreable_object_id
    )
    if (existingBounty) {
      return res.status(400).json({
        message: 'This player already has a bounty for this scoreable object'
      })
    }
  }
  try {
    const newScoringEvent = await ScoringEvent.query().insert(req.body)
    res.status(201).json(newScoringEvent)
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: err.message })
  }
})

// Update scoringEvent
router.patch('/:id', getScoringEvent, async (req, res) => {
  try {
    const updatedScoringEvent = await res.scoringEvent.$query().patch(req.body)
    res.json(updatedScoringEvent)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete scoringEvent
router.delete('/:id', getScoringEvent, async (req, res) => {
  try {
    await res.scoringEvent.$query().delete()
    res.json({ message: 'Deleted ScoringEvent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Middleware function for getting scoringEvent by ID
async function getScoringEvent (req, res, next) {
  console.log('tried to get scoringEvent')
  let scoringEvent
  try {
    scoringEvent = await ScoringEvent.query().findById(req.params.id)
    if (scoringEvent == null) {
      return res.status(404).json({ message: 'Cannot find scoringEvent' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.scoringEvent = scoringEvent
  next()
}

//get scoringEvent list by user id
router.get('/by-user/:id', async (req, res) => {
  console.log(req.params)
  if (req.params.id === 'undefined') {
    res.status(400).json({ message: 'User ID is required' })
  }
  try {
    // fetch all scoring events for a user where the user_id matches the id in the request
    let scoringEvents = await ScoringEvent.query()
      .where('user_id', req.params.id)
      .withGraphFetched('[scoreableObject,league, user, team]')

    // filter out events where scorableObject's Type is not team_bounty or team_objective
    scoringEvents = scoringEvents.filter(event => {
      return (
        event.scoreableObject.submittableType !== 'team_bounty' &&
        event.scoreableObject.submittableType !== 'team_objective'
      )
    })

    res.json(scoringEvents)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message })
  }
})

router.get('/by-team/:id', async (req, res) => {
  console.log(req.params)

  try {
    let scoringEvents = await ScoringEvent.query()
      .where('team_id', req.params.id)
      .withGraphFetched('[scoreableObject,league, user, team]')
    scoringEvents = scoringEvents.filter(event => {
      return (
        event.scoreableObject.submittableType !== 'account_bounty' &&
        event.scoreableObject.submittableType !== 'account_objective' &&
        event.scoreableObject.submittableType !== 'character_objective'
      )
    })

    res.json(scoringEvents)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/approveable/list', async (req, res) => {
  try {
    const scoringEvents = await ScoringEvent.query()
      .where('is_approved', false)
      .withGraphFetched('[scoreableObject,league, user,team]')
    console.log(scoringEvents)
    res.json(scoringEvents)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/league/:id', async (req, res) => {
  try {
    const scoringEvents = await ScoringEvent.query().where(
      'league_id',
      req.params.id
    )
    res.json(scoringEvents)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.get('/scoreByTeam/:id', async (req, res) => {
  try {
    const scoringEvents = await ScoringEvent.query().where(
      'team_id',
      req.params.id
    )
    totalScore = 0
    scoringEvents.forEach(event => {
      totalScore += event.score
    })
    res.json(totalScore)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/scoreByTeam/:id/:type', async (req, res) => {
  try {
    const scoringEvents = await ScoringEvent.query()
      .where('team_id', req.params.id)
      .andWhere('type', req.params.type)
    totalScore = 0
    scoringEvents.forEach(event => {
      totalScore += event.score
    })
    res.json(totalScore)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
