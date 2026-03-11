/**
 * Clerk Authentication Middleware
 * Optional: Use this to protect routes that require authentication
 */

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No token provided",
      });
    }

    // In production, verify the token with Clerk
    // This is a simplified example - you'd verify with Clerk's API
    req.userId = token; // This would be decoded properly in production

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Unauthorized - Invalid token",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      // Verify with Clerk if token exists
      req.userId = token; // Decoded properly in production
    }

    next();
  } catch (error) {
    // Continue without auth if token verification fails
    next();
  }
};
