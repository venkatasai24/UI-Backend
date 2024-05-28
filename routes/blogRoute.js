const express = require("express");
const {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlog,
  getCategoryBlog,
  getTagBlog,
  getBlogsByTitle,
} = require("../controllers/blogController");
const { handleUser } = require("../middleware/auth");
const blogRouter = express.Router();

blogRouter.get("/", getBlogs);
blogRouter.get("/:id", getBlog);
blogRouter.get("/search/:title", getBlogsByTitle);
blogRouter.get("/tags/:tag", getTagBlog);
blogRouter.get("/categories/:category", getCategoryBlog);
blogRouter.post("/", handleUser, createBlog);
blogRouter.put("/:id", handleUser, updateBlog);
blogRouter.delete("/:id", handleUser, deleteBlog);

module.exports = blogRouter;
