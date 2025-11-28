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

// Server listen with Socket.io integration
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Socket auth middleware (validate JWT and attach user)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Unauthorized'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return next(new Error('Unauthorized'));
    socket.user = user; // attach minimal user in socket
    next();
  } catch (err) {
    console.error('Socket auth error', err.message);
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'user:', socket.user?._id);

  socket.on('join', ({ projectId }) => {
    if (!projectId) return;
    const room = `project_${projectId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);
  });

  socket.on('leave', ({ projectId }) => {
    if (!projectId) return;
    const room = `project_${projectId}`;
    socket.leave(room);
    console.log(`Socket ${socket.id} left ${room}`);
  });

  socket.on('chat:message', async (payload) => {
    try {
      const { projectId, text } = payload || {};
      if (!projectId || !text) return;
      // persist message
      const m = new Message({ projectId, sender: socket.user._id, text });
      const saved = await m.save();
      const populated = await saved.populate('sender', 'name email');
      const room = `project_${projectId}`;
      io.to(room).emit('chat:message', populated);
    } catch (err) {
      console.error('chat:message handler error:', err.message);
      socket.emit('error', { message: 'Message failed' });
    }
  });

  socket.on('disconnect', () => {
    // handle disconnects if needed
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on: http://localhost:${PORT}`));

