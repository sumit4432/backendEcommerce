const jwt = require("jsonwebtoken");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");
exports.requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    // If a JWT token is present, perform token-based authentication
    const token = req.headers.authorization.split(" ")[1];
    try {
      const user = jwt.verify(token, process.env.JWT_KEY);
      req.user = user;
      console.log("User authenticated via JWT:", user);
      next();
    } catch (error) {
      console.error("JWT verification error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else if (req.session && req.session.user) {
    // If no JWT token but a session with user data is present, consider the user authenticated
    console.log("User authenticated via session:", req.session.user);
    req.user = req.session.user;
    next();
  } else {
    // No JWT token or session user data, consider the user unauthenticated
    console.error("Authentication missing");
    return res.status(401).json({ message: "Authentication missing" });
  }
};




exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ message: "User access denied" });
  }
  next();
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    if (req.user.role !== "super-admin") {
      return res.status(400).json({ message: "Admin access denied" });
    }
  }
  next();
};

exports.superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== "super-admin") {
    return res.status(200).json({ message: "Super Admin access denied" });
  }
  next();
};