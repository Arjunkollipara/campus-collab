const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProjectById,
  updateProject, joinProject, toggleOpen, deleteProject, approveMember, removeMember
} = require('../controller/projectController');

const requireAuth = require('../middleware/requireAuth');
const { getMessages, postMessage } = require('../controller/chatController');


router.delete('/:id', requireAuth, deleteProject);
router.post('/', requireAuth, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);

router.put('/:id', requireAuth, updateProject);
router.post('/:id/join', requireAuth, joinProject);
router.put('/:id/toggle', requireAuth, toggleOpen);
router.put('/:id/approve', requireAuth, approveMember);
router.put('/:id/remove', requireAuth, removeMember);
// Chat message history (REST)
router.get('/:id/messages', getMessages);
router.post('/:id/messages', requireAuth, postMessage);

module.exports = router;
