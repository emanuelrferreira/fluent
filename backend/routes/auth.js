const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, firebaseUid } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = new User({ name, email, firebaseUid });
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile/:uid
router.put('/profile/:uid', async (req, res) => {
  try {
    const { nativeLanguage, targetLanguage, proficiencyLevel } = req.body;
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      { nativeLanguage, targetLanguage, proficiencyLevel },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
