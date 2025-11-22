const User = require('../models/User');

// @desc    Create a new user
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validation of input
    if (!name || typeof name !== 'string' || !email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Invalid input' });
    }
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Update user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMe = async (req, res) => {
  const u = req.user;
  res.json({
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
    updatedAt: u.updatedAt
  });
};

 1 
module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getMe
};