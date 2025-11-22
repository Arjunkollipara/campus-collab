const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: '' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
