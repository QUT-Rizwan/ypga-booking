const express = require('express');
const {
  getPlans, getAllPlans, createPlan, updatePlan, deletePlan,
  getMyMembership, purchaseMembership, renewMembership, getAllMemberships,
} = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const router = express.Router();

// Plans
router.get('/plans', getPlans);                              // public
router.get('/plans/all', protect, adminOnly, getAllPlans);   // admin
router.post('/plans', protect, adminOnly, createPlan);       // admin
router.put('/plans/:id', protect, adminOnly, updatePlan);    // admin
router.delete('/plans/:id', protect, adminOnly, deletePlan); // admin

// User memberships
router.get('/my', protect, getMyMembership);                 // member
router.post('/purchase', protect, purchaseMembership);       // member
router.put('/renew', protect, renewMembership);              // member
router.get('/', protect, adminOnly, getAllMemberships);       // admin

module.exports = router;
