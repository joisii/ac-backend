const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

// ------------------- ADMIN LOGIN -------------------
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN HIT");
  console.log("BODY:", req.body);})

//   const { username, password } = req.body;

//   try {
//     const admin = await Admin.findOne({ username });

//     if (!admin || admin.password !== password) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid credentials" });
//     }

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// ------------------- CHANGE PASSWORD -------------------
router.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.password !== oldPassword) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 🔁 Replace old password with new one
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
