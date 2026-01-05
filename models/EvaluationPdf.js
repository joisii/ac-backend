const mongoose = require("mongoose");

const EvaluationPdfSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["project", "service"],
    unique: true,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EvaluationPdf", EvaluationPdfSchema);
