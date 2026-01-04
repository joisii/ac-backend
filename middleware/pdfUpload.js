const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");


// Cloudinary config (uses ENV variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for PDFs
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const type = req.body.type || req.params.type; // project | service

    return {
      folder: "pdfs",
      resource_type: "raw", // 🔥 REQUIRED for PDFs
      public_id: `${type}-evaluation`, // always replaces old PDF
      format: "pdf",
    };
  },
});

// Allow ONLY PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = uploadPdf;
