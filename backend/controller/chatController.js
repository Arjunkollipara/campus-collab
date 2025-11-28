const Message = require('../models/Message');

// GET /api/projects/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const projectId = req.params.id;
    const messages = await Message.find({ projectId }).sort({ createdAt: 1 }).populate('sender', 'name email');
    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// POST /api/projects/:id/messages - optional REST fallback
exports.postMessage = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { text } = req.body;
    const sender = req.user._id;
    const m = new Message({ projectId, sender, text });
    const saved = await m.save();
    const populated = await saved.populate('sender', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    console.error('postMessage error:', err.message);
    res.status(500).json({ message: 'Failed to post message' });
  }
};
