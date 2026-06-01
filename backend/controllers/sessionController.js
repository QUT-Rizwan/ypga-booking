const Session = require('../models/Session');

// GET /api/sessions — public, optional ?venue=id&date=YYYY-MM-DD
const getSessions = async (req, res) => {
  try {
    const filter = { isCancelled: false, date: { $gte: new Date() } };
    if (req.query.venue) filter.venue = req.query.venue;
    if (req.query.date) {
      const d = new Date(req.query.date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }
    const sessions = await Session.find(filter)
      .populate('venue', 'name address suburb')
      .sort({ date: 1, startTime: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sessions/all — admin
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('venue', 'name suburb')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sessions/:id
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('venue');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sessions — admin
const createSession = async (req, res) => {
  try {
    const { isRecurring, recurringEndDate, ...baseData } = req.body;
    const sessions = [];

    if (isRecurring && recurringEndDate) {
      let current = new Date(baseData.date);
      const end = new Date(recurringEndDate);
      while (current <= end) {
        sessions.push({ ...baseData, date: new Date(current), isRecurring: true, recurringEndDate });
        current.setDate(current.getDate() + 7);
      }
      const created = await Session.insertMany(sessions);
      return res.status(201).json(created);
    }

    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/sessions/:id — admin
const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('venue', 'name suburb');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/sessions/:id — admin (soft cancel)
const cancelSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id, { isCancelled: true }, { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSessions, getAllSessions, getSessionById, createSession, updateSession, cancelSession };
