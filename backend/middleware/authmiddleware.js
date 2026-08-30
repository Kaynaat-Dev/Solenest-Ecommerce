/* ==========================================================================
   AUTH MIDDLEWARE
   A "gatekeeper" function that runs BEFORE a protected route's actual
   logic. It checks whether the request has a valid JWT token attached.
   If yes, it lets the request through and attaches the user's info to
   `req.user` so the route can use it. If no, it blocks the request.
   ========================================================================== */

const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  // The frontend sends the token in a header like this:
  //   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  // We need to pull just the token part out (after "Bearer ").
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1]; // "Bearer XYZ" -> "XYZ"

  try {
    // jwt.verify checks two things at once:
    //  1. Was this token actually signed with OUR secret key? (not faked)
    //  2. Has it expired yet? (based on the expiresIn we set at login)
    // If either check fails, this line throws an error, caught below.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user id to the request object so any route
    // using this middleware can access `req.user.id` afterward.
    req.user = { id: decoded.id };

    next(); // everything checks out — let the request continue to the actual route
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

module.exports = protect;