const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Public Cloudinary URL (used directly in frontend <img src="..." />)
    logo: {
      type: String,
      required: true,
    },

    // Cloudinary public_id (used to delete / replace image)
    logoPublicId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
