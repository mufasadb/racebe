const express = require('express');
const router = express.Router();
const League = require('../models/league.js');

// Get all leagues
router.get('/', async (req, res) => {
  try {
    const leagues = await League.query();
    res.json(leagues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get league by ID
router.get('/:id', getLeague, (req, res) => {
  res.json(res.league);
});

// Create league
router.post('/', async (req, res) => {
  try {
    //convert string of score multiplier to float
    req.body.score_multiplier = parseFloat(req.body.score_multiplier);
    const newLeague = await League.query().insert(req.body);
    res.status(201).json(newLeague);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update league
router.patch('/:id', getLeague, async (req, res) => {
  try {
    const updatedLeague = await res.league.$query().patch(req.body);
    res.json(updatedLeague);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete league
router.delete('/:id', getLeague, async (req, res) => {
  try {
    await res.league.$query().delete();
    res.json({ message: 'Deleted League' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function for getting league by ID
async function getLeague(req, res, next) {
    console.log("tried to get league")
  let league;
  try {
    league = await League.query().findById(req.params.id);
    if (league == null) {
      return res.status(404).json({ message: 'Cannot find league' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.league = league;
  next();
}

module.exports = router;