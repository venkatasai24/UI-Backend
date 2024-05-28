const Blog = require("../models/blog");
const User = require("../models/user");

//get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({});
    if (blogs.length > 0) {
      res.status(200).json(blogs.reverse());
    } else {
      res.status(404).json({ message: "No blogs found." });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

//get specific blogs by title
const getBlogsByTitle = async (req, res) => {
  let { query } = req.params;
  if (!query) {
    return res.status(400).json({ message: "query field required!!" });
  }
  query = escapeRegex(query);
  const regex = new RegExp(query, "i"); // case-insensitive regex
  try {
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: regex } },
        { tags: { $regex: regex } },
        { categories: { $regex: regex } },
      ],
    });
    if (blogs.length > 0) {
      res.status(200).json(blogs);
    } else {
      res.status(404).json({ message: `No blogs found with query ${query}` });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//get specific blog
const getBlog = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "all fields required!!" });
  }
  const blog = await Blog.findOne({ _id: id });
  if (blog) {
    //need correction
    res.status(201).json(blog);
  } else {
    res.status(400).json({ message: "error fetching blog" });
  }
};

//get blogs related to specific tag
const getTagBlog = async (req, res) => {
  const { tag } = req.params;
  if (!tag) {
    return res.status(400).json({ message: "All fields are required!" });
  }
  try {
    const blogs = await Blog.find({ tags: { $regex: tag, $options: "i" } });
    if (blogs.length > 0) {
      res.status(200).json(blogs);
    } else {
      res.status(404).json({ message: "No blogs found with this tag." });
    }
  } catch (error) {
    console.error("Error fetching blogs by tag:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//get blogs related to specific category
const getCategoryBlog = async (req, res) => {
  const { category } = req.params;
  if (!category) {
    return res.status(400).json({ message: "All fields are required!" });
  }
  try {
    const blogs = await Blog.find({
      categories: { $regex: category, $options: "i" },
    });
    if (blogs.length > 0) {
      res.status(200).json(blogs);
    } else {
      res.status(404).json({ message: "No blogs found with this category." });
    }
  } catch (error) {
    console.error("Error fetching blogs by tag:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//create blog
const createBlog = async (req, res) => {
  const { title, description, categories, tags } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "all fields required!!" });
  }
  const blog = await Blog.create({
    title,
    description,
    categories,
    tags,
    createdBy: req.user.email,
  });
  if (blog) {
    // Retrieve the user
    const user = await User.findOne({ email: req.user.email });
    // Update the user's blogs array
    user.blogs.push(blog);
    // Save the updated user back to the database
    await user.save();
    res.status(201).json(blog);
  } else {
    res.status(400).json({ message: "error creating blog" });
  }
};

//update blog
const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { email, title, description, categories, tags } = req.body;
  if (!email || !id || !title || !description) {
    return res.status(400).json({ message: "all fields required!!" });
  }
  if (email !== req?.user?.email) {
    return res.status(400).json({ message: "not authorized" });
  }
  const blog = await Blog.updateOne(
    { _id: id },
    { $set: { title, description, categories, tags } }
  );
  if (blog) {
    //need correction
    res.status(201).json(blog);
  } else {
    res.status(400).json({ message: "error updating blog" });
  }
};

//delete blog
const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!id || !email) {
    return res.status(400).json({ message: "All fields required!!" });
  }
  if (email !== req?.user?.email) {
    return res.status(400).json({ message: "not authorized" });
  }
  try {
    // Delete the blog
    const deletedBlog = await Blog.deleteOne({ _id: id });
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // Retrieve the user
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update the user's blogs array
    user.blogs = user.blogs.filter((blog) => blog.toString() !== id);
    // Save the updated user back to the database
    await user.save();
    res.status(200).json(deletedBlog);
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createBlog,
  getBlog,
  getBlogsByTitle,
  getTagBlog,
  getCategoryBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
};
