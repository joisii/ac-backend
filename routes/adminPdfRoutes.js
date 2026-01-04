const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

/* -----------------------------
   TEMP STORAGE (SAFE)
----------------------------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `temp-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files allowed"), false);
};

const upload = multer({ storage, fileFilter });

/* -----------------------------
   UPLOAD / REPLACE
----------------------------- */
router.post("/upload-pdf", upload.single("pdf"), (req, res) => {
  try {
    const { type } = req.body;

    console.log("UPLOAD TYPE:", type); // 🔍 DEBUG

    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    if (!["project", "service"].includes(type)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Invalid PDF type" });
    }

    const finalName = `${type}-evaluation-sheet.pdf`;
    const finalPath = path.join("uploads", finalName);

    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
    }

    fs.renameSync(req.file.path, finalPath);

    res.json({
      success: true,
      message: `${type} evaluation sheet replaced`,
      pdfUrl: `/uploads/${finalName}`,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "PDF upload failed" });
  }
});


/* -----------------------------
   FETCH PDF URL
----------------------------- */
router.get("/get-pdf/:type", (req, res) => {
  const { type } = req.params;

  if (!["project", "service"].includes(type)) {
    return res.status(400).json({ message: "Invalid PDF type" });
  }

  const fileName = `${type}-evaluation-sheet.pdf`;
  const filePath = path.join("uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "PDF not found" });
  }

  res.json({
    pdfUrl: `/uploads/${fileName}`,
  });
});

module.exports = router;
