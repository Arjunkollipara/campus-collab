const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const sanitize = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  skills: u.skills,
  bio: u.bio,
  links: u.links,
  badges: u.badges || [],
  selectedBadges: u.selectedBadges || [],
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email, password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    // Only allow admin creation if a special secret is provided
    let userRole = 'user';
    if (role === 'admin' && adminSecret === process.env.ADMIN_SECRET) {
      userRole = 'admin';
    }
    const user = await User.create({ name, email, password: hash, role: userRole });
    // Award signup badge if not present
    if (!user.badges.includes('signup')) {
      user.badges.push('signup');
      if (user.selectedBadges.length === 0) user.selectedBadges.push('signup');
      await user.save();
    }

    const token = signToken(user._id);
    res.status(201).json({ user: sanitize(user), token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.banned) {
      return res.status(403).json({ message: user.banReason || 'Your account has been banned.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ user: sanitize(user), token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
