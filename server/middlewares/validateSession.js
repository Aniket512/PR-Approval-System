const jwt = require("jsonwebtoken");
const User = require("../models/User");

const validateSession = async (req, res, next) => {
  const { access_token } = req.headers;

  if (!access_token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(access_token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ error: "The user no longer exists" });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = validateSession;
