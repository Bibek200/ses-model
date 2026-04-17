const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a user
 * @param {string} id - User MongoDB ObjectId
 * @param {string} role - User role
 * @returns {string} signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = generateToken;
