const express = require('express')
const router = express.Router()
const Team = require('../models/team.js')
const ScoringEvent = require('../models/scoringEvent.js')
const User = require('../models/user.js')
const ScoreableObject = require('../models/scoreableObject.js')
//end point for the team comparison page

//return for each team: name, total points, bounties claimed, total scoring events
//most recent bounty (what it was, user who claimed it, and when it was claimed)
//most recent contributer
//top 3 contributers

router.get('/team-comparison', async (req, res) => {
  //get all teams
  //get all scoring events
  //check if each scoring event was a bounty and set isBounty
  //get all users

  const teams = await Team.query()

  //only get scoring events that have been approved
  const scoringEvents = await ScoringEvent.query()
    .where('is_approved', true)
    .withGraphFetched('[scoreableObject,league]')
  const users = await User.query()
  for (const event of scoringEvents) {
    // console.log(event)
    // const scoreableObject = await ScoreableObject.query().findById(
    //   event.scoreableObjectId
    // )
    const scoreableObject = event.scoreableObject
    if (
      scoreableObject.submittableType === 'player_bounty' ||
      scoreableObject.submittableType === 'team_bounty' ||
      scoreableObject.submittableType === 'server_bounty'
    ) {
      event.isBounty = true
    } else {
      event.isBounty = false
    }
  }

  const teamComparison = []
  for (const team of teams) {
    const teamData = {
      teamName: team.name,
      teamColour: team.colour,
      totalPoints: 0,
      bountiesClaimed: 0,
      totalScoringEvents: 0,
      mostRecentBounty: {
        name: '',
        claimedBy: '',
        claimedAt: ''
      },
      mostRecentContributer: {
        username: '',
        claimedAt: ''
      },
      topContributers: []
    }
    for (const scoreEvent of scoringEvents) {
      if (scoreEvent.teamId === team.id) {
        console.log(`new scoring event ---- for ${team.name}`)
        console.log(
          `event${scoreEvent.name}, leageMUlti ${scoreEvent.scoreableObject.leagueMultiplyer}, points ${scoreEvent.scoreableObject.points}, leagueMult ${scoreEvent.league.scoreMultiplier}`
        )
        teamData.totalPoints += scoreEvent.scoreableObject.leagueMultiplyer
          ? scoreEvent.scoreableObject.points *
            scoreEvent.league.scoreMultiplier
          : scoreEvent.scoreableObject.points
        console.log(`new total points ${teamData.totalPoints}`)
        teamData.totalScoringEvents++
        if (scoreEvent.isBounty) {
          teamData.bountiesClaimed++
          if (scoreEvent.createdAt > teamData.mostRecentBounty.claimedAt) {
            teamData.mostRecentBounty.name = scoreEvent.scoreableObject.name
            teamData.mostRecentBounty.claimedAt = scoreEvent.createdAt
            const user = await User.query().findById(scoreEvent.userId)
            teamData.mostRecentBounty.username = user.username
            // const ScoreableObject = await ScoreableObject.query().findById(
            //   event.scoreableObjectId
            // )
            // teamData.mostRecentBounty.username = ScoreableObject.username
          }
        }
        if (scoreEvent.createdAt > teamData.mostRecentContributer.claimedAt) {
          const user = await User.query().findById(scoreEvent.userId)
          teamData.mostRecentContributer.username = user.username
          teamData.mostRecentContributer.claimedAt = scoreEvent.createdAt
        }
      }
    }
    teamComparison.push(teamData)
  }
  res.json(teamComparison)
})

router.get('/leader-board', async (req, res) => {
  console.log('fetching leaderboard')
  const users = await User.query()
  const scoringEvents = await ScoringEvent.query()
    .where('is_approved', true)
    .withGraphFetched('[scoreableObject,league]')
  const teams = await Team.query()
  const userScores = []
  for (const user of users) {
    let score = 0
    let count = 0
    // console.log(user)
    for (const scoreEvent of scoringEvents) {
      // console.log(scoreEvent)
      if (scoreEvent.userId === user.id) {
        score += scoreEvent.scoreableObject.leagueMultiplyer
          ? scoreEvent.scoreableObject.points *
            scoreEvent.league.scoreMultiplier
          : scoreEvent.scoreableObject.points
        count++
      }
    }
    user.score = score
    user.scoredEventsCount = count
    team = teams.find(team => team.id === user.teamId)
    user.teamName = team ? team.name : 'No Team'
    user.teamColour = team ? team.colour : '#FFFFFF'
    userScores.push(user)
  }
  userScores.sort((a, b) => {
    return b.score - a.score
  })
  res.json(userScores)
})

module.exports = router
