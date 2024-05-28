const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (email) => {
  const accessToken = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ email }, process.env.REFRESH_SECRET, {
    expiresIn: "1d",
  });
  return { accessToken, refreshToken };
};

module.exports = { generateToken };
