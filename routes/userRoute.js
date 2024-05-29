const express = require("express");
const {
  loginUser,
  registerUser,
  getUser,
  // getUserBlogs,
  refreshUserToken,
  logoutUser,
  updatePassword,
  getBookMarks,
  addBookMark,
  deleteBookMark,
  updateUser,
} = require("../controllers/userController");
const { handleUser } = require("../middleware/auth");
const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.put("/update-password", updatePassword);
userRouter.get("/profile/:email", getUser);
userRouter.get("/refresh", refreshUserToken);
// userRouter.get("/my-blogs", handleUser, getUserBlogs);
userRouter.get("/bookmarks", handleUser, getBookMarks);
userRouter.post("/bookmarks/:id", handleUser, addBookMark);
userRouter.delete("/bookmarks/:id", handleUser, deleteBookMark);
userRouter.post("/edit-profile", handleUser, updateUser);
userRouter.get("/logout", logoutUser);

module.exports = userRouter;
