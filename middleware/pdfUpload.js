const multer = require("multer");
const path = require("path");

// Where & how file should be stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const type = req.body.type; // project OR service
    const ext = path.extname(file.originalname);

    // This will always REPLACE the old file
    cb(null, `${type}-evaluation${ext}`);
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

const uploadPdf = multer({ storage, fileFilter });

module.exports = uploadPdf;
