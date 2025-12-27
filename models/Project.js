const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: String,
  location: String,
  application: String,
  acType: String,
  category: {
    type: String,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Project', ProjectSchema);
