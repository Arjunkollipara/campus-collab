const Project = require('../models/Project');
const User = require('../models/User');

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { title, description = '', requiredSkills = [] } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const ownerId = req.user._id;
    const owner = await User.findById(ownerId);
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    // Count existing owned projects to determine first_project badge eligibility
    const existingCount = await Project.countDocuments({ owner: ownerId });

    const project = await Project.create({
      title, description, requiredSkills, owner: ownerId, members: [ownerId],
    });

    if (existingCount === 0 && !owner.badges.includes('first_project')) {
      owner.badges.push('first_project');
      if (owner.selectedBadges.length === 0) owner.selectedBadges.push('first_project');
      await owner.save();
    }

    res.status(201).json(project);
  } catch (err) {
    console.error('Project creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/projects?isOpen=true&skill=React
const getProjects = async (req, res) => {
  try {
    const { isOpen, skill } = req.query;
    const q = {};
    if (isOpen !== undefined) q.isOpen = isOpen === 'true';
    if (skill) q.requiredSkills = { $in: [skill] };

    const projects = await Project.find(q)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('pendingMembers', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const p = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('pendingMembers', 'name email');
    if (!p) return res.status(404).json({ message: 'Project not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/projects/:id/join
const joinProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Project not found' });
    // Only allow join if not already member or pending
    if (p.members.some(m => m.toString() === userId.toString()))
      return res.status(400).json({ message: 'Already a member' });
    if (p.pendingMembers.some(m => m.toString() === userId.toString()))
      return res.status(400).json({ message: 'Already requested to join' });

    p.pendingMembers.push(userId);
    await p.save();
    const populated = await Project.findById(p._id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('pendingMembers', 'name email');
    res.json({ message: 'Request sent, waiting for approval', project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/projects/:id/approve  { userId }
const approveMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Project not found' });
    // Only owner can approve
    if (p.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Remove from pendingMembers, add to members
    p.pendingMembers = p.pendingMembers.filter(m => m.toString() !== userId);
    if (!p.members.some(m => m.toString() === userId)) {
      p.members.push(userId);
    }
    await p.save();
    const populated = await Project.findById(p._id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('pendingMembers', 'name email');
    res.json({ message: 'Member approved', project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/projects/:id/remove  { userId }
const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Project not found' });
    // Only owner can remove
    if (p.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Remove from members and pendingMembers
    p.members = p.members.filter(m => m.toString() !== userId);
    p.pendingMembers = p.pendingMembers.filter(m => m.toString() !== userId);
    await p.save();
    const populated = await Project.findById(p._id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate('pendingMembers', 'name email');
    res.json({ message: 'Member removed', project: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/projects/:id/toggle
const toggleOpen = async (req, res) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Project not found' });
    // Only owner can toggle open/close
    if (p.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close/open this project' });
    }
    p.isOpen = !p.isOpen;
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if the logged-in user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.remove();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  joinProject,
  toggleOpen,
  deleteProject,
  approveMember,
  removeMember
};