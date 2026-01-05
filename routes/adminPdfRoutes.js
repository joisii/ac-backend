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

    if (!["project", "service"].includes(type)) {
      return res.status(400).json({ message: "Invalid PDF type" });
    }

    if (!req.file || !req.file.filename) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    await EvaluationPdf.findOneAndUpdate(
      { type },
      {
        publicId: req.file.filename, // ✅ ONLY publicId
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

    if (!["project", "service"].includes(type)) {
      return res.status(400).json({ message: "Invalid PDF type" });
    }

    const record = await EvaluationPdf.findOne({ type });

    if (!record || !record.publicId) {
      return res.status(404).json({ message: "PDF not found" });
    }

    // 🔐 Generate signed Cloudinary URL using publicId
    const signedUrl = cloudinary.utils.private_download_url(
      record.publicId,
      "pdf",
      { resource_type: "raw" }
    );

    // 🌊 Stream PDF
    const response = await axios.get(signedUrl, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Disposition", "inline");

    response.data.pipe(res);
  } catch (err) {
    console.error("PDF STREAM ERROR:", err.message);
    res.status(500).json({ message: "Failed to stream PDF" });
  }
});

module.exports = router;
