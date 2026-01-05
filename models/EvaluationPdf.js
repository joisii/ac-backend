const mongoose = require("mongoose");

const EvaluationPdfSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true },
    publicId: { type: String, required: true },
    url: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EvaluationPdf", EvaluationPdfSchema);
