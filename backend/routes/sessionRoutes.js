const express = require('express');
const {
  getSessions, getAllSessions, getSessionById,
  createSession, updateSession, cancelSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/', getSessions);                              // public
router.get('/all', protect, adminOnly, getAllSessions);    // admin
router.get('/:id', getSessionById);                        // public
router.post('/', protect, adminOnly, createSession);       // admin
router.put('/:id', protect, adminOnly, updateSession);     // admin
router.delete('/:id', protect, adminOnly, cancelSession);  // admin

module.exports = router;
