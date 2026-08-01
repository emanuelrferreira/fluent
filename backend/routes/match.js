const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await User.findOne({
      nativeLanguage: user.targetLanguage,
      targetLanguage: user.nativeLanguage,
      firebaseUid: { $ne: user.firebaseUid }
    });
    if (!match) return res.status(404).json({ message: 'No match found yet' });
    res.json({ match });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
