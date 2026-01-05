const cloudinary = require("cloudinary").v2;

/* --------------------------------
   Cloudinary Configuration
-------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // ✅ always use https URLs
});

/* --------------------------------
   Optional: Startup validation
   (helps catch Render env mistakes)
-------------------------------- */
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn("⚠️ Cloudinary ENV variables missing");
} else {
  console.log("✅ Cloudinary configured successfully");
}

module.exports = cloudinary;
