const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    let admin = await Admin.findOne({ username });

    // 🔥 If admin doesn't exist → create it
    if (!admin) {
      admin = await Admin.create({ username, password });
      console.log("✅ Admin auto-created");
      return res.json({ success: true, firstLogin: true });
    }

    // Normal login
    if (admin.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// ------------------- CHANGE PASSWORD -------------------
router.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    // 1️⃣ Find admin by username
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // 2️⃣ Verify old password
    if (admin.password !== oldPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // 3️⃣ Update password
    admin.password = newPassword;
    await admin.save();

    // 4️⃣ Success
    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

module.exports = router;
