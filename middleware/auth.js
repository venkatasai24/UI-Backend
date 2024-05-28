const jwt = require("jsonwebtoken");
const User = require("../models/user");

const handleUser = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get user from the token
      // console.log(decoded);
      req.user = await User.findOne({ email: decoded.email }).select(
        "-password -refreshToken"
      );

      // console.log(req.user);
      next();
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "not authorized" });
    }
  }

  if (!token) {
    res.status(400).json({ message: "not authorized as no token exists" });
  }
};

module.exports = { handleUser };
