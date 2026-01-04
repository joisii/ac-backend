const express = require("express");
const uploadPdf = require("../middleware/pdfUpload"); // Cloudinary multer
const EvaluationPdf = require("../models/EvaluationPdf");

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

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const pdfUrl = req.file.path; // ✅ REAL Cloudinary URL (versioned)

    const record = await EvaluationPdf.findOneAndUpdate(
      { type },
      { url: pdfUrl, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `${type} evaluation PDF uploaded successfully`,
      pdfUrl: record.url,
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

    const record = await EvaluationPdf.findOne({ type });

    if (!record) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.json({ pdfUrl: record.url });
  } catch (err) {
    console.error("FETCH PDF ERROR:", err);
    res.status(500).json({ message: "Failed to fetch PDF" });
  }
});

module.exports = router;
