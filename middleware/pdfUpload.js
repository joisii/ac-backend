const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req) => {
    const { type } = req.params;

    if (!["project", "service"].includes(type)) {
      throw new Error("Invalid PDF type");
    }

    return {
      folder: "pdfs",
      resource_type: "raw",
      format: "pdf",
      public_id: `${type}-evaluation`, // 🔑 IMPORTANT
      overwrite: true,
      access_mode: "private", // 🔐 keep secure
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files allowed"), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
