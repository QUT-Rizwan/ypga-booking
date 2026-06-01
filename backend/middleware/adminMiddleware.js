const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

const memberOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'member' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Active membership required' });
  }
};

module.exports = { adminOnly, memberOrAdmin };
