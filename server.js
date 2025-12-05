require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import models
const Sale = require('./models/Sale');
const ServiceRequest = require('./models/ServiceRequest');

// Initialize app
const app = express();

// ------------------------------------
// 🔧 UPDATED CORS Middleware (FIXED)
// ------------------------------------
const allowedOrigins = [
  'https://gvjwebsite.netlify.app',  // Old frontend
  'https://www.gvjaircon.com',       // ✅ NEW LIVE DOMAIN
  'http://localhost:3000'            // Local development
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

// ------------------------------------
// 🚀 Start Server
// ------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
