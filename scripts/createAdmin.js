require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Admin.create({
      username: "admin",
      password: "gvj@123"
    });

    console.log("✅ Admin created");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
