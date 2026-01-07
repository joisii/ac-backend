require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existing = await Admin.findOne({ username: "admin" });

    if (!existing) {
      await Admin.create({
        username: "admin",
        password: "gvj@123",
      });
      console.log("✅ Admin created");
    } else {
      console.log("⚠️ Admin already exists");
    }

    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
