const MembershipPlan = require('../models/MembershipPlan');
const Membership = require('../models/Membership');

// GET /api/memberships/plans — public
const getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memberships/plans/all — admin
const getAllPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memberships/plans — admin
const createPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/memberships/plans/:id — admin
const updatePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/memberships/plans/:id — admin
const deletePlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memberships/my — member
const getMyMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user._id,
    }).populate('plan').sort({ createdAt: -1 });
    res.json(membership || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/memberships/purchase — member
const purchaseMembership = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await MembershipPlan.findById(planId);
    if (!plan || !plan.isActive) return res.status(404).json({ message: 'Plan not found' });

    const existing = await Membership.findOne({
      user: req.user._id, status: 'active', endDate: { $gte: new Date() },
    });
    if (existing) return res.status(400).json({ message: 'You already have an active membership' });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const membership = await Membership.create({
      user: req.user._id, plan: planId, startDate, endDate, status: 'active',
    });
    res.status(201).json(await membership.populate('plan'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/memberships/renew — member
const renewMembership = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await MembershipPlan.findById(planId);
    if (!plan || !plan.isActive) return res.status(404).json({ message: 'Plan not found' });

    const existing = await Membership.findOne({ user: req.user._id }).sort({ endDate: -1 });
    const startDate = existing && existing.endDate > new Date() ? new Date(existing.endDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const membership = await Membership.create({
      user: req.user._id, plan: planId, startDate, endDate, status: 'active',
    });
    res.status(201).json(await membership.populate('plan'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/memberships — admin
const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find()
      .populate('user', 'name email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlans, getAllPlans, createPlan, updatePlan, deletePlan,
  getMyMembership, purchaseMembership, renewMembership, getAllMemberships,
};
