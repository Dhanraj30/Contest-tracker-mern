//server/models/Contest.js
const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  url: { type: String, required: true },
  bookmarked: { type: Boolean, default: false },
  clistId: { type: Number, required: true, unique: true }, // Add unique CLIST ID
});

module.exports = mongoose.model('Contest', contestSchema);