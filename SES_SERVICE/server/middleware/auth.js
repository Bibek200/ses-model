const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorized, forbidden } = require('../utils/apiResponse');

/**
 * Protect routes — verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return unauthorized(res, 'Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return unauthorized(res, 'User no longer exists');
    }

    if (!user.isActive) {
      return forbidden(res, 'Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    return unauthorized(res, 'Not authorized — invalid token');
  }
};

/**
 * Authorize specific roles
 * Usage: authorize('super_admin', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res, 'Not authorized');
    }
    if (!roles.includes(req.user.role)) {
      return forbidden(
        res,
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
