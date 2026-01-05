const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* --------------------------------
   Cloudinary Storage for PDFs
   (SAFE + PRODUCTION READY)
-------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pdfs",
    resource_type: "raw",      // ✅ REQUIRED for PDFs
    format: "pdf",
    overwrite: true,

    // ⚠️ IMPORTANT:
    // public_id must be a FUNCTION
    // DO NOT read req.body synchronously earlier
    public_id: (req) => {
      const type = req.body?.type;

      if (!["project", "service"].includes(type)) {
        throw new Error("Invalid PDF type");
      }

      return `${type}-evaluation`;
    },
  },
});

/* --------------------------------
   Allow ONLY PDFs
-------------------------------- */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

/* --------------------------------
   Multer Instance
-------------------------------- */
const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

module.exports = uploadPdf;
