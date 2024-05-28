const express = require("express");
const {
  loginUser,
  registerUser,
  getUser,
  // getUserBlogs,
  refreshUserToken,
  logoutUser,
  updatePassword,
} = require("../controllers/userController");
const { handleUser } = require("../middleware/auth");
const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.put("/update-password", updatePassword);
userRouter.get("/profile/:email", getUser);
userRouter.get("/refresh", refreshUserToken);
// userRouter.get("/my-blogs", handleUser, getUserBlogs);
userRouter.get("/logout", logoutUser);

module.exports = userRouter;
