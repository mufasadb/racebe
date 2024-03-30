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
  console.log(`get team bounties by ${req.session}`)
  console.log(req.params)

  const teamBounties = await ScoreableObject.query().where(
    'submittableType',
    'team_bounty'
  )
  const teamObjectives = await ScoreableObject.query().where(
    'submittableType',
    'team_objective'
  )

  try {
    const scoringEvents = await ScoringEvents.query().withGraphFetched(
      'scoreableObject'
    )
    const bountiesEvents = scoringEvents.filter(
      scoringEvent =>
        scoringEvent.scoreableObject.submittableType === 'team_bounty'
    )

    const thisTeamsEvents = scoringEvents.filter(
      scoringEvent => scoringEvent.scoreableObject.teamId === req.params.id
    )

    const availableBounties = []

    for (bountySObjects of teamBounties) {
      let found = false
      for (teamEVent of bountiesEvents) {
        if (bountySObjects.id === teamEVent.scoreableObjectId) {
          found = true
        }
      }
      if (!found) {
        availableBounties.push(bountySObjects)
      }
    }
    for (teamObjective of teamObjectives) {
      let found = false
      for (teamEVent of thisTeamsEvents) {
        if (teamObjective.id === teamEVent.scoreableObjectId) {
          found = true
        }
      }
      if (!found) {
        availableBounties.push(teamObjective)
      }
    }

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
  console.log(`get user bounties by ${req.session}`)
  console.log(req.params)
  try {
    //get scoringEvents by type bounty
    //get scoringEvents  from this user
    // get objectives that are character_objectives, account_objectives and account_bounties
    //created a list of available bounties which is every character or account objective which hasn't been done
    // by this user, + and account_bounties which haven't been done by anyone

    const playerBounties = await ScoreableObject.query().where(
      'submittableType',
      'account_bounty'
    )
    const playerObjectives = await ScoreableObject.query().where(
      'submittableType',
      'account_objective'
    )
    const characterObjectives = await ScoreableObject.query().where(
      'submittableType',
      'character_objective'
    )

    const scoringEvents = await ScoringEvents.query().withGraphFetched(
      'scoreableObject'
    )
    const bountiesEvents = scoringEvents.filter(
      scoringEvent =>
        scoringEvent.scoreableObject.submittableType === 'player_bounty'
    )

    const thisPlayersEvents = scoringEvents.filter(
      scoringEvent => scoringEvent.scoreableObject.userId === req.params.id
    )

    const availableBounties = []

    for (bountySObjects of playerBounties) {
      let found = false
      for (playerEVent of bountiesEvents) {
        if (bountySObjects.id === playerEVent.scoreableObjectId) {
          found = true
        }
      }
      if (!found) {
        availableBounties.push(bountySObjects)
      }
    }
    for (playerObjective of playerObjectives) {
      let found = false
      for (playerEVent of thisPlayersEvents) {
        if (playerObjective.id === playerEVent.scoreableObjectId) {
          found = true
        }
      }
      if (!found) {
        availableBounties.push(playerObjective)
      }
    }

    const sortedBounties = availableBounties.sort((a, b) => {
      return a.sortOrder - b.sortOrder
    })
    res.json(sortedBounties)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
