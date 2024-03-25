const express = require('express')
const router = express.Router()
const ScoreableObject = require('../models/scoreableObject.js')
const ScoringEvents = require('../models/scoringEvent.js')

// Get all scoreableObjects
router.get('/', async (req, res) => {
  console.log('hit the / SObjects endpoint')
  try {
    const scoreableObjects = await ScoreableObject.query()

    const sortedBounties = scoreableObjects.sort((a, b) => {
      return a.sortOrder - b.sortOrder
    })
    res.json(sortedBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get scoreableObject by ID
router.get('/:id', getScoreableObject, (req, res) => {
  console.log('hit the /id SObjects  endpoint')
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
    const sortedBounties = scoreableObjects.sort((a, b) => {
      return a.sortOrder - b.sortOrder
    })
    res.json(sortedBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//scoreable league bounties remaining

//scoreable team bounties remaining for this team
router.get('/available/team-bounties/:id', async (req, res) => {
  try {
    const scoringEvents = await ScoringEvents.query().where(
      'team_id',
      req.params.id
    )
    const scoreableObjects = await ScoreableObject.query()
    const filteredObjects = scoreableObjects.filter(
      scoreableObject =>
        scoreableObject.submittableType === 'team_bounty' ||
        scoreableObject.submittableType === 'team_objective'
    )

    const availableBounties = scoreableObjects.filter(scoreableObject => {
      return scoringEvents.every(
        scoringEvent => scoringEvent.scoreableObjectId !== scoreableObject.id
      )
    })
    const sortedBounties = availableBounties.sort((a, b) => {
      return a.sortOrder - b.sortOrder
    })
    res.json(sortedBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//scoreable player bounties reamining for this player
router.get('/available/player-bounties/:id', async (req, res) => {
  try {
    const scoringEvents = await ScoringEvents.query().where(
      'user_id',
      req.params.id
    )

    // get scoreable objects where submittable type is account_bounty, account_objective, or character_objective
    const scoreableObjects = await ScoreableObject.query()

    const filteredObjects = scoreableObjects.filter(
      scoreableObject =>
        scoreableObject.submittableType === 'account_bounty' ||
        scoreableObject.submittableType === 'account_objective' ||
        scoreableObject.submittableType === 'character_objective'
    )

    const availableBounties = filteredObjects.filter(scoreableObject => {
      return scoringEvents.every(
        scoringEvent => scoringEvent.scoreableObjectId !== scoreableObject.id
      )
    })
    const sortedBounties = availableBounties.sort((a, b) => {
      return a.sortOrder - b.sortOrder
    })
    res.json(sortedBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
