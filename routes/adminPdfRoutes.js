const express = require("express");
const uploadPdf = require("../middleware/pdfUpload"); // 👈 Cloudinary middleware
const cloudinary = require("../config/cloudinary");

const router = express.Router();

/* --------------------------------
   UPLOAD / REPLACE PDF (ADMIN)
-------------------------------- */
router.post("/upload-pdf", uploadPdf.single("pdf"), async (req, res) => {
  try {
    const { type } = req.body;

    if (!["project", "service"].includes(type)) {
      return res.status(400).json({ message: "Invalid PDF type" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    // Cloudinary URL
    const pdfUrl = req.file.path;

    res.json({
      success: true,
      message: `${type} evaluation PDF uploaded successfully`,
      pdfUrl,
    });
  } catch (err) {
    console.error("PDF UPLOAD ERROR:", err);
    res.status(500).json({ message: "PDF upload failed" });
  }
});

/* --------------------------------
   FETCH PDF URL (PUBLIC)
-------------------------------- */
router.get("/get-pdf/:type", async (req, res) => {
  try {
    const { type } = req.params;

    if (!["project", "service"].includes(type)) {
      return res.status(400).json({ message: "Invalid PDF type" });
    }

    /*
      Since Cloudinary overwrites the same public_id,
      we can construct the URL directly.
    */

    const pdfUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/pdfs/${type}-evaluation.pdf`;

    res.json({ pdfUrl });
  } catch (err) {
    console.error("FETCH PDF ERROR:", err);
    res.status(500).json({ message: "Failed to fetch PDF" });
  }
});

module.exports = router;
