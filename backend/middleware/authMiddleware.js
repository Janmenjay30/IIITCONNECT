const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }

    req.user = await User.findById(decoded.id).select('-password'); // Attach user to the request
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

module.exports = authMiddleware;