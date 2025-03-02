const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const [bearer, token] = authHeader.split(' ');  // Split the header

  if (!token || bearer !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("verified",verified);
    req.user = verified.user.id;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
