import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// ✅ Ensure uploads directory exists (IMPORTANT for Render)
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ---------------- GET PDF PATH ----------------
router.get("/:type", (req, res) => {
  const { type } = req.params;

  if (!["project", "service"].includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }

  const filename = `${type}-evaluation-sheet.pdf`;
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "PDF not found" });
  }

  // ⚠️ IMPORTANT: no localhost in production
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json({
    pdfUrl: `${baseUrl}/uploads/${filename}`,
  });
});

export default router;
