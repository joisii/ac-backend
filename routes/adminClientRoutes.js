const express = require("express");
const Client = require("../models/Client");
const uploadClientLogo = require("../middleware/clientUpload"); // cloudinary multer
const cloudinary = require("../config/cloudinary");


const router = express.Router();

/**
 * ------------------ ADD CLIENT ------------------
 * POST /admin/clients
 */
router.post(
  "/admin/clients",
  uploadClientLogo.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Logo image is required" });
      }

      const client = new Client({
        name: req.body.name,
        logo: req.file.path, // ✅ Cloudinary URL
        logoPublicId: req.file.filename, // ✅ needed for delete/update
      });

      await client.save();
      res.json({ message: "Client added successfully", client });
    } catch (err) {
      console.error("ADD CLIENT ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * ------------------ GET CLIENTS ------------------
 * GET /clients
 */
router.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error("FETCH CLIENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * ------------------ UPDATE CLIENT ------------------
 * PUT /admin/clients/:id
 */
router.put(
  "/admin/clients/:id",
  uploadClientLogo.single("logo"),
  async (req, res) => {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Update name
      if (req.body.name) {
        client.name = req.body.name;
      }

      // If new logo uploaded → delete old logo from Cloudinary
      if (req.file) {
        if (client.logoPublicId) {
          await cloudinary.uploader.destroy(client.logoPublicId);
        }

        client.logo = req.file.path; // new Cloudinary URL
        client.logoPublicId = req.file.filename; // new public_id
      }

      await client.save();
      res.json({ message: "Client updated successfully", client });
    } catch (err) {
      console.error("UPDATE CLIENT ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * ------------------ DELETE CLIENT ------------------
 * DELETE /admin/clients/:id
 */
router.delete("/admin/clients/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Delete logo from Cloudinary
    if (client.logoPublicId) {
      await cloudinary.uploader.destroy(client.logoPublicId);
    }

    await client.deleteOne();
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("DELETE CLIENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
