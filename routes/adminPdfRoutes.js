const express = require("express");
const uploadPdf = require("../middleware/pdfUpload");
const EvaluationPdf = require("../models/EvaluationPdf");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

/* --------------------------------
   UPLOAD / REPLACE PDF (ADMIN)
-------------------------------- */
router.post(
  "/upload-pdf/:type",
  uploadPdf.single("pdf"),
  async (req, res) => {
    try {
      const { type } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No PDF uploaded" });
      }

      // Save to MongoDB
      const updated = await EvaluationPdf.findOneAndUpdate(
        { type },
        {
          type,
          publicId: req.file.public_id, // Cloudinary public ID
          url: req.file.path,            // Cloudinary URL (includes .pdf)
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        message: `${type} PDF uploaded successfully`,
        data: updated,
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

/* --------------------------------
   STREAM PDF
-------------------------------- */
router.get("/pdf/:type", async (req, res) => {
  try {
    const { type } = req.params;

    if (!["project", "service"].includes(type)) {
      return res.status(400).json({ message: "Invalid PDF type" });
    }

    const record = await EvaluationPdf.findOne({ type });

    if (!record || !record.url) {
      return res.status(404).json({ message: "PDF not found" });
    }

    // ✅ Redirect directly to Cloudinary URL
    return res.redirect(record.url);
  } catch (err) {
    console.error("PDF FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load PDF" });
  }
});

module.exports = router;
