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

    if (!req.file || !req.file.filename) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    await EvaluationPdf.findOneAndUpdate(
      { type },
      {
        publicId: req.file.filename, // ex: project-evaluation
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
   STREAM PDF (SECURE PUBLIC ACCESS)
-------------------------------- */
/* --------------------------------
   STREAM PDF (SECURE + WORKING)
-------------------------------- */
/* --------------------------------
   STREAM PDF (STABLE & WORKING)
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

    // ✅ Direct RAW delivery URL
    const fileUrl = cloudinary.url(`pdfs/${record.publicId}`, {
      resource_type: "raw",
      secure: true,
    });

    const response = await axios.get(fileUrl, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "no-store");

    response.data.pipe(res);
  } catch (err) {
    console.error("PDF STREAM ERROR:", err);
    res.status(500).json({ message: "Failed to stream PDF" });
  }
});



module.exports = router;
