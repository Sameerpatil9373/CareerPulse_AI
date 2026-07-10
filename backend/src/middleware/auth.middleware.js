const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id =
      decoded?.id ||
      decoded?.userId ||
      decoded?._id ||
      decoded?.user?.id;

    req.user = { ...decoded, id };
    next(); 
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    next(error);
  }
};

module.exports = authMiddleware;