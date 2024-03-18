const express = require('express');
const router = express.Router();
const Character = require('../models/character.js');

// Get all characters
router.get('/', async (req, res) => {
  try {
    const characters = await Character.query();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get character by ID
router.get('/:id', getCharacter, (req, res) => {
  res.json(res.character);
});

// Create character
router.post('/', async (req, res) => {
  try {
    const newCharacter = await Character.query().insert(req.body);
    res.status(201).json(newCharacter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update character
router.patch('/:id', getCharacter, async (req, res) => {
  try {
    const updatedCharacter = await res.character.$query().patch(req.body);
    res.json(updatedCharacter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete character
router.delete('/:id', getCharacter, async (req, res) => {
  try {
    await res.character.$query().delete();
    res.json({ message: 'Deleted Character' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function for getting character by ID
async function getCharacter(req, res, next) {
    console.log("tried to get character")
  let character;
  try {
    character = await Character.query().findById(req.params.id);
    if (character == null) {
      return res.status(404).json({ message: 'Cannot find character' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.character = character;
  next();
}

//get character list by user id
router.get('/user/:id', async (req, res) => {
  try {
    const characters = await Character.query().where('user_id', req.params.id);
    res.json(characters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;