const { verifyAccessToken } = require('../utils/jwt');

/**
 * JWT Authentication Middleware
 * Verifies the access token from the Authorization header
 * Attaches decoded user info to req.user if valid
 */
const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Access token required. Please provide Authorization header with Bearer token." });
  }

  try {
    // Verify the token and decode user info
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request object for use in controllers
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

    // Continue to next middleware/route handler
    next();
  } catch (err) {
    // Token is invalid or expired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired. Please refresh your token." });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token." });
    }
    return res.status(401).json({ message: "Authentication failed." });
  }
};

module.exports = { authenticateToken };

