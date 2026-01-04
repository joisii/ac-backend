const mongoose = require("mongoose");

const aboutStatsSchema = new mongoose.Schema(
  {
    coolingInstalledTR: {
      type: Number,
      required: true,
      min: 0,
    },
    clientsServed: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutStats", aboutStatsSchema);
