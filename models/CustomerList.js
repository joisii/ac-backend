// models/CustomerList.js
const mongoose = require("mongoose");

const CustomerListSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["warranty", "amc"],
    required: true
  },
  sno: { type: Number, required: true },
  client: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("CustomerList", CustomerListSchema);
