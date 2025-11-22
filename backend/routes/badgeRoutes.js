const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { listBadges, awardBadge, updateSelectedBadges, createBadge, updateBadge, deleteBadge } = require('../controller/badgeController');

// Listing badges does not require auth (catalog only)
router.get('/', listBadges);

// Admin management
router.post('/', requireAuth, createBadge);
router.put('/:code', requireAuth, updateBadge);
router.delete('/:code', requireAuth, deleteBadge);

// bulk award (admin)
router.post('/award/bulk', requireAuth, require('../controller/badgeController').bulkAward);

// user badge actions
router.post('/award/:userId', requireAuth, awardBadge);
router.patch('/selected', requireAuth, updateSelectedBadges);

module.exports = router;
