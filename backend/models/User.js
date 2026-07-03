const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, required: true, unique: true },
  nativeLanguage: { type: String, default: '' },
  targetLanguage: { type: String, default: '' },
  proficiencyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  sessionsCompleted: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
