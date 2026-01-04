const express = require("express");
const Client = require("../models/Client");
const upload = require("../middleware/clientUpload");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ------------------ ADD CLIENT ------------------
router.post(
  "/admin/clients",
  (req, res, next) => {
    upload.single("logo")(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Logo image is required" });
      }

      const client = new Client({
        name: req.body.name,
        logo: `/uploads/clients/${req.file.filename}`,
      });

      await client.save();
      res.json({ message: "Client added successfully" });
    } catch (err) {
      console.error("ADD CLIENT ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ------------------ GET CLIENTS ------------------
router.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error("FETCH CLIENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ------------------ UPDATE CLIENT ------------------
router.put(
  "/admin/clients/:id",
  (req, res, next) => {
    upload.single("logo")(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const client = await Client.findById(req.params.id);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Update name
      client.name = req.body.name || client.name;

      // If new logo uploaded → delete old logo
      if (req.file) {
        // Remove leading slash to get proper file path
        const oldLogoPath = path.join(__dirname, "..", client.logo.replace(/^\/+/, ""));

        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath); // delete old logo
        }

        // set new logo path
        client.logo = `/uploads/clients/${req.file.filename}`;
      }

      await client.save();
      res.json({ message: "Client updated successfully" });
    } catch (err) {
      console.error("UPDATE CLIENT ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ------------------ DELETE CLIENT ------------------
router.delete("/admin/clients/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Properly resolve file path to delete logo
    const logoPath = path.join(__dirname, "..", client.logo.replace(/^\/+/, ""));

    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    await client.deleteOne();
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("DELETE CLIENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
