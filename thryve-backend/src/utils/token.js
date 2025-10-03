const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = { userId: user._id, email: user.email };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = { generateToken };
