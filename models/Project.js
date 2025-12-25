const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: String,
  location: String,
  application: String,
  acType: String,
  category: String,     // restaurant, gym, hospital, etc.
  isActive: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
