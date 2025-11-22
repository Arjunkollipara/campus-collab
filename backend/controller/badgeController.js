const configBadges = require('../config/badges');
const Badge = require('../models/Badge');
const User = require('../models/User');

// GET /api/badges - list catalog
exports.listBadges = async (req, res) => {
  try {
    const list = await Badge.find().sort({ code: 1 }).lean();
    // fallback: if DB empty, return config (useful during first-run)
    if (!list || list.length === 0) return res.json(configBadges);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/badges - create new badge (admin only)
exports.createBadge = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { code, name, icon = '', image = '', description = '' } = req.body;
    if (!code || !name) return res.status(400).json({ message: 'code and name are required' });
    const exists = await Badge.findOne({ code });
    if (exists) return res.status(409).json({ message: 'Badge code already exists' });
    const b = await Badge.create({ code, name, icon, image, description });
    res.status(201).json(b);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/badges/:code - update badge (admin only)
exports.updateBadge = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const code = req.params.code;
    const badge = await Badge.findOne({ code });
    if (!badge) return res.status(404).json({ message: 'Badge not found' });
    const { name, icon, image, description } = req.body;
    if (name) badge.name = name;
    if (icon !== undefined) badge.icon = icon;
    if (image !== undefined) badge.image = image;
    if (description !== undefined) badge.description = description;
    await badge.save();
    res.json(badge);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/badges/:code - remove badge (admin only)
exports.deleteBadge = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const code = req.params.code;
    const badge = await Badge.findOneAndDelete({ code });
    if (!badge) return res.status(404).json({ message: 'Badge not found' });
    res.json({ message: 'Badge removed', badge });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/badges/award/:userId { code }
exports.awardBadge = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Badge code required' });
    const exists = await Badge.findOne({ code });
    if (!exists) return res.status(404).json({ message: 'Badge not found' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.badges.includes(code)) {
      user.badges.push(code);
      // Auto-select if user has no selections yet
      if (user.selectedBadges.length === 0) user.selectedBadges.push(code);
      await user.save();
    }
    res.json({ message: 'Badge awarded', user: { _id: user._id, badges: user.badges, selectedBadges: user.selectedBadges } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/badges/selected { selected: [codes] }
exports.updateSelectedBadges = async (req, res) => {
  try {
    const { selected } = req.body;
    if (!Array.isArray(selected)) return res.status(400).json({ message: 'selected must be an array' });

    // Only allow selecting badges the user has earned
    const filtered = selected.filter(code => req.user.badges.includes(code));
    req.user.selectedBadges = filtered;
    await req.user.save();
    res.json({ message: 'Selected badges updated', selectedBadges: req.user.selectedBadges });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/badges/award/bulk { code, criteria }
// criteria: 'all' | 'hasProfile'  (defaults to 'all')
exports.bulkAward = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { code, criteria = 'all' } = req.body;
    if (!code) return res.status(400).json({ message: 'Badge code required' });
    const exists = badges.find(b => b.code === code);
    if (!exists) return res.status(404).json({ message: 'Badge not found' });

    let users = [];
    if (criteria === 'hasProfile') {
      const Profile = require('../models/Profile');
      const profiles = await Profile.find({}, 'userId');
      const ids = profiles.map(p => p.userId);
      users = await User.find({ _id: { $in: ids } });
    } else {
      users = await User.find({});
    }

    let awarded = 0;
    for (const u of users) {
      if (!u.badges.includes(code)) {
        u.badges.push(code);
        if (!u.selectedBadges || u.selectedBadges.length === 0) u.selectedBadges = [code];
        await u.save();
        awarded++;
      }
    }

    res.json({ message: 'Bulk award completed', code, criteria, awarded });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
