
// server/models/SolutionLink.js
const mongoose = require('mongoose');

const solutionLinkSchema = new mongoose.Schema({
    contestId: String, // Unique contest identifier from API
    platform: String,
    youtubeLink: String,
  });
  
module.exports = mongoose.model('SolutionLink', solutionLinkSchema);