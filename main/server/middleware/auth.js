const jwt = require("jsonwebtoken");

/**
 * Middleware: verify the JWT token sent in the Authorization header.
 * Attaches `req.user = { id, email }` on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

module.exports = requireAuth;
