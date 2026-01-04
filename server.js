require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
import path from "path";
import { fileURLToPath } from "url";

// Import models
const Sale = require('./models/Sale');
const ServiceRequest = require('./models/ServiceRequest');
const Project=require('./models/Project');
const AboutStats = require('./models/AboutStats');
const CustomerList = require('./models/CustomerList');
const adminPdfRoutes = require("./routes/adminPdfRoutes");
const adminClientRoutes=require("./routes/adminClientRoutes");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();

// ------------------------------------
// 🔧 UPDATED CORS Middleware (FIXED)
// ------------------------------------
const allowedOrigins = [
  'https://gvjwebsite.netlify.app',  // Old frontend
  'https://www.gvjaircon.com',       // ✅ NEW LIVE DOMAIN
  'http://localhost:3000'     
       // Local development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // ✅ allow OPTIONS
  credentials: true
}));

// ✅ Handle Preflight Requests
app.options('*', cors());

// Middleware
app.use(express.json());

// ------------------------------------
// 🌐 MongoDB Atlas Connection
// ------------------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ------------------------------------
// 🏠 Root Route
// ------------------------------------
app.get('/', (req, res) => {
  res.send('🚀 Backend is up and running!');
});

// ------------------------------------
// 🔐 Admin Login Route
// ------------------------------------
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ------------------------------------
// 🧾 SALES ROUTES
// ------------------------------------
app.get('/sales', async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales', error: err });
  }
});

app.post('/sales', async (req, res) => {
  try {
    const newSale = new Sale(req.body);
    await newSale.save();
    res.json(newSale);
  } catch (err) {
    res.status(500).json({ message: 'Error saving sale', error: err });
  }
});

app.delete('/sales/:id', async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting sale', error: err });
  }
});

// ------------------------------------
// 🧰 SERVICE REQUESTS ROUTES
// ------------------------------------
app.get('/requests', async (req, res) => {
  try {
    const requests = await ServiceRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests', error: err });
  }
});

app.post('/requests', async (req, res) => {
  try {
    const newRequest = new ServiceRequest(req.body);
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Error saving request', error: err });
  }
});

app.delete('/requests/:id', async (req, res) => {
  try {
    await ServiceRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting request', error: err });
  }
});

// ------------------- Projects API -------------------

app.get('/projects', async (req, res) => {
  try {
    const { category, admin } = req.query;

    // Admin sees all projects, users see only active ones
    const filter = admin === 'true' ? {} : { isActive: true };

    if (category) {
      filter.category = category;
    }

    const projects = await Project.find(filter)
  .select("name location application acType category")
  .lean();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err });
  }
});

app.post('/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ message: 'Error saving project', error: err });
  }
});

app.put('/projects/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: 'Error updating project', error: err });
  }
});

// ------------------- HARD DELETE -------------------
app.delete('/projects/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err });
  }
});

// ------------------------------------
// 📊 ABOUT STATS API (ADD THIS HERE)
// ------------------------------------

// About Stats Routes
app.get('/about-stats', async (req, res) => {
  try {
    let stats = await AboutStats.findOne();

    if (!stats) {
      stats = await AboutStats.create({
        coolingInstalledTR: 0,
        clientsServed: 0,
      });
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching about stats',
      error: err,
    });
  }
});

app.put('/about-stats', async (req, res) => {
  try {
    const { coolingInstalledTR, clientsServed } = req.body;

    if (
      typeof coolingInstalledTR !== 'number' ||
      typeof clientsServed !== 'number'
    ) {
      return res.status(400).json({ message: 'Invalid data type' });
    }

    const stats = await AboutStats.findOneAndUpdate(
      {},
      { coolingInstalledTR, clientsServed },
      { new: true, upsert: true }
    );

    res.json(stats);
  } catch (err) {
    res.status(500).json({
      message: 'Error updating about stats',
      error: err,
    });
  }
});

// ------------------- GET ALL CUSTOMERS -------------------
app.get("/customers", async (req, res) => {
  try {
    const warranty = await CustomerList.find({ type: "warranty" }).sort({ sno: 1 }).lean();
    const amc = await CustomerList.find({ type: "amc" }).sort({ sno: 1 }).lean();
    res.json({ warranty, amc });
  } catch (err) {
    res.status(500).json({ message: "Error fetching customers", error: err });
  }
});

// ------------------- ADD CUSTOMER -------------------
app.post("/customers", async (req, res) => {
  try {
    const { type, client } = req.body;
    if (!type || !client) return res.status(400).json({ message: "Type and client are required" });

    const last = await CustomerList.findOne({ type }).sort({ sno: -1 });
    const newSno = last ? last.sno + 1 : 1;

    const newCustomer = new CustomerList({ type, client, sno: newSno });
    await newCustomer.save();

    res.json(newCustomer);
  } catch (err) {
    res.status(500).json({ message: "Error adding customer", error: err });
  }
});

// ------------------- EDIT CUSTOMER -------------------
app.put("/customers/:id", async (req, res) => {
  try {
    const { client } = req.body;
    if (!client) return res.status(400).json({ message: "Client name required" });

    const updatedCustomer = await CustomerList.findByIdAndUpdate(
      req.params.id,
      { client },
      { new: true }
    );

    if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });

    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ message: "Error updating customer", error: err });
  }
});

// ------------------- DELETE CUSTOMER -------------------
app.delete("/customers/:id", async (req, res) => {
  try {
    const deletedCustomer = await CustomerList.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting customer", error: err });
  }
});
 
//Project evaluaton sheet and Service evaluation sheet
// Serve uploaded PDFs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/admin", adminPdfRoutes);

//project section clients
app.use("/api", require("./routes/adminClientRoutes"));




// 🚀 Start Server
// ------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
