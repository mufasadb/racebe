const express = require('express');
const router = express.Router();
const Team = require('../models/team');

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.query();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get team by ID
router.get('/:id', getTeam, (req, res) => {
  res.json(res.team);
});

// Create team
router.post('/', async (req, res) => {
  try {
    const newTeam = await Team.query().insert(req.body);
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update team
router.patch('/:id', getTeam, async (req, res) => {
  try {
    const updatedTeam = await res.team.$query().patch(req.body);
    res.json(updatedTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete team
router.delete('/:id', getTeam, async (req, res) => {
  try {
    await res.team.$query().delete();
    res.json({ message: 'Deleted Team' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function for getting team by ID
async function getTeam(req, res, next) {
  let team;
  try {
    team = await Team.query().findById(req.params.id);
    if (team == null) {
      return res.status(404).json({ message: 'Cannot find team' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.team = team;
  next();
}

module.exports = router;