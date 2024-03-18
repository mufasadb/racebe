const express = require('express')
const router = express.Router()
const ScoreableObject = require('../models/scoreableObject.js')
const ScoringEvents = require('../models/scoringEvent.js')

// Get all scoreableObjects
router.get('/', async (req, res) => {
  console.log('hit the / all endpoint')
  try {
    const scoreableObjects = await ScoreableObject.query()
    res.json(scoreableObjects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get scoreableObject by ID
router.get('/:id', getScoreableObject, (req, res) => {
  console.log('hit the /id endpoint')
  res.json(res.scoreableObject)
})

// Create scoreableObject
router.post('/', async (req, res) => {
  if (res.points == 0) {
    res.status(400).json({ message: 'Points are required' })
  }
  try {
    const newScoreableObject = await ScoreableObject.query().insert(req.body)
    res.status(201).json(newScoreableObject)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Update scoreableObject
router.patch('/:id', getScoreableObject, async (req, res) => {
  try {
    const updatedScoreableObject = await res.scoreableObject
      .$query()
      .patch(req.body)
    res.json(updatedScoreableObject)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete scoreableObject
router.delete('/:id', getScoreableObject, async (req, res) => {
  try {
    await res.scoreableObject.$query().delete()
    res.json({ message: 'Deleted ScoreableObject' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Middleware function for getting scoreableObject by ID
async function getScoreableObject (req, res, next) {
  console.log('tried to get scoreableObject')
  let scoreableObject
  try {
    scoreableObject = await ScoreableObject.query().findById(req.params.id)
    if (scoreableObject == null) {
      return res.status(404).json({ message: 'Cannot find scoreableObject' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.scoreableObject = scoreableObject
  next()
}

//get scoreableObject list by user id
router.get('/user/:id', async (req, res) => {
  try {
    const scoreableObjects = await ScoreableObject.query().where(
      'user_id',
      req.params.id
    )
    res.json(scoreableObjects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//scoreable league bounties remaining
router.get('/available/league-bounties', async (req, res) => {
  console.log('trying to get league bounties')
  try {
    const scoringEvents = await ScoringEvents.query()
    const scoreableObjects = await ScoreableObject.query().where(
      'submittable_type',
      'server_bounty'
    )
    const availableBounties = scoreableObjects.filter(scoreableObject => {
      return scoringEvents.every(
        scoringEvent => scoringEvent.scoreableObjectId !== scoreableObject.id
      )
    })
    res.json(availableBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
//scoreable team bounties remaining for this team
router.get('/available/team-bounties/:id', async (req, res) => {
  //get all scoring events
  //get all scoreable objects whose type is team_bounty
  //filter out any scoreabkle objects who have a scoring event with that ID
  //return the remaining scoreable objects
  try {
    const scoringEvents = await ScoringEvents.query().where(
      'team_id',
      req.params.id
    )
    const scoreableObjects = await ScoreableObject.query().where(
      'submittable_type',
      'team_bounty'
    )
    const availableBounties = scoreableObjects.filter(scoreableObject => {
      return scoringEvents.every(
        scoringEvent => scoringEvent.scoreableObjectId !== scoreableObject.id
      )
    })
    res.json(availableBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//scoreable player bounties reamining for this player
router.get('/available/player-bounties/:id', async (req, res) => {
  //get all scoring events
  //get all scoreable objects whose type is player_bounty
  //filter out any scoreabkle objects who have a scoring event with that ID
  //return the remaining scoreable objects
  try {
    const scoringEvents = await ScoringEvents.query().where(
      'user_id',
      req.params.id
    )
    const scoreableObjects = await ScoreableObject.query().where(
      'submittable_type',
      'player_bounty'
    )
    const availableBounties = scoreableObjects.filter(scoreableObject => {
      return scoringEvents.every(
        scoringEvent => scoringEvent.scoreableObjectId !== scoreableObject.id
      )
    })
    res.json(availableBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
