const express = require("express");
const uploadPdf = require("../middleware/pdfUpload");
const EvaluationPdf = require("../models/EvaluationPdf");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");

const router = express.Router();

/* --------------------------------
   UPLOAD / REPLACE PDF (ADMIN)
-------------------------------- */
router.post("/upload-pdf/:type", uploadPdf.single("pdf"), async (req, res) => {
  try {
    const { type } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const record = await EvaluationPdf.findOneAndUpdate(
      { type },
      {
        publicId: req.file.filename, // ✅ THIS is the key
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `${type} evaluation PDF uploaded successfully`,
    });
  } catch (err) {
    console.error("PDF UPLOAD ERROR:", err);
    res.status(500).json({ message: "PDF upload failed" });
  }
});

/* --------------------------------
   STREAM PDF (PUBLIC SAFE ACCESS)
-------------------------------- */
router.get("/pdf/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const record = await EvaluationPdf.findOne({ type });
    if (!record) return res.status(404).json({ message: "PDF not found" });

    const signedUrl = cloudinary.utils.private_download_url(
      record.publicId,
      "pdf",
      { resource_type: "raw" }
    );

    const response = await axios.get(signedUrl, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "no-store");

    response.data.pipe(res);
  } catch (err) {
    console.error("PDF STREAM ERROR:", err.message);
    res.status(500).json({ message: "Failed to stream PDF" });
  }
});

module.exports = router;
