const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* --------------------------------
   Cloudinary Storage for PDFs
-------------------------------- */
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
      public_id: `${type}-evaluation`, // ✅ NO .pdf
      overwrite: true,
    };
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
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = uploadPdf;
