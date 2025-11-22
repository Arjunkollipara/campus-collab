require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();


// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse incoming JSON


// Test route
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Bring in Routes (mount before listening)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const badgeRoutes = require('./routes/badgeRoutes');
app.use('/api/badges', badgeRoutes);

// Seed badges from config into DB if collection is empty
const Badge = require('./models/Badge');
const configBadges = require('./config/badges');
const seedBadges = async () => {
  try {
    const count = await Badge.countDocuments();
    if (count === 0) {
      await Badge.insertMany(configBadges.map(b => ({ code: b.code, name: b.name, icon: b.icon, image: b.image, description: b.description })));
      console.log('Seeded badge catalog into DB');
    }
  } catch (err) {
    console.error('Badge seed error:', err.message);
  }
};
seedBadges();

// Debug route list (simple confirmation)
app.get('/__routes', (req, res) => {
  const stack = app._router.stack
    .filter(r => r.route && r.route.path)
    .map(r => `${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  res.json(stack);
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on: http://localhost:${PORT}`));

