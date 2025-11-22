const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // role support
  banned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  skills: { type: [String], default: [] },
  bio:    { type: String, default: '' },
  links: {
    github:   { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio:{ type: String, default: '' },
  },
  // Earned badge codes (e.g., 'leader', 'innovator')
  badges: { type: [String], default: [] },
  // Subset of earned badges the user wants to display
  selectedBadges: { type: [String], default: [] }
},
{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
