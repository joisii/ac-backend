const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sale', saleSchema);
