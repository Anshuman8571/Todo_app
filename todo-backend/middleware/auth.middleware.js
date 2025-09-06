// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No token found" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // login created token as: jwt.sign({ userId: user._id }, ...)
    // normalize to req.user._id for downstream controllers
    req.user = { _id: payload.userId || payload.userId }; 
    return next();
  } catch (error) {
    console.error("auth failed", error);
    return res.status(401).json({ message: "Invalid Token" });
  }
};
