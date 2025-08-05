const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  name: String,
  contact: String,
  issue: String,
  status: String,
});

module.exports = mongoose.model('ServiceRequest', RequestSchema);
