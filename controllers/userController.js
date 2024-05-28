const bcrypt = require("bcrypt");
const User = require("../models/user");
const Blog = require("../models/blog");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/genToken");

//get user
const getUser = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: "email required!!" });
  }
  //check if user doesnt exists
  const user = await User.findOne({ email }).select(
    "-password -refreshToken -bookMarks"
  );
  if (!user) {
    return res.status(400).json({ message: "User doesnt exists!!" });
  }
  res.status(201).json(user);
};

//get user associated blogs
// const getUserBlogs = async (req, res) => {
//   const blogIds = req.user.blogs;
//   let blogs = [];
//   try {
//     for (const element of blogIds) {
//       const blog = await Blog.findOne({ _id: element });
//       if (blog) {
//         blogs.push(blog);
//       } else {
//         return res.status(400).json({ message: "error fetching user blogs" });
//       }
//     }
//     res.status(201).json(blogs.reverse());
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ message: "internal server error" });
//   }
// };

// Get bookmarks
const getBookMarks = async (req, res) => {
  const { bookMarks } = req.user;
  return res.status(200).json(bookMarks);
};

// Add bookmark
const addBookMark = async (req, res) => {
  const { email } = req.user;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "ID field required!" });
  }
  try {
    const user = await User.findOne({ email }).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.bookMarks.includes(id)) {
      return res.status(400).json({ message: "Bookmark already exists" });
    }
    user.bookMarks.push(id);
    await user.save();
    return res.status(200).json(user.bookMarks);
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete bookmark
const deleteBookMark = async (req, res) => {
  const { email } = req.user;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "ID field required!" });
  }
  try {
    const user = await User.findOne({ email }).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.bookMarks = user.bookMarks.filter(
      (bookMark) => bookMark.toString() !== id
    );
    await user.save();
    return res.status(200).json(user.bookMarks);
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//create user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Require all fields!!" });
  }
  //check if user already exists
  const findUser = await User.findOne({ email });
  if (findUser) {
    return res.status(400).json({ message: "User already exists!!" });
  }
  //hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

//authenticate user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Require all fields!!" });
  }
  //check if user doesnt exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User doesnt exists!!" });
  }
  if (user && (await bcrypt.compare(password, user.password))) {
    const tokens = generateToken(user.email);
    // Saving refreshToken with current user
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.cookie("jwt", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      email: user.email,
      accessToken: tokens.accessToken,
    });
  } else {
    res.status(400).json({ message: "Invalid user credentials" });
  }
};

//update password
const updatePassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    ///hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password has been updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password" });
  }
};

//refresh the token
const refreshUserToken = async (req, res) => {
  const cookies = req.cookies;
  //check if cookie exists
  if (cookies?.jwt) {
    // Destructuring refreshToken from cookie
    const refreshToken = cookies.jwt;
    // Verifying refresh token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err) {
        // Wrong Refesh Token
        return res.status(406).json({ message: "Unauthorized" });
      } else {
        // Correct token we send a new access token
        const accessToken = jwt.sign(
          { email: decoded.email },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );
        return res.json({ accessToken, email: decoded.email });
      }
    });
  } else {
    return res.status(406).json({ message: "Unauthorized" });
  }
};

//logout the user
const logoutUser = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  await foundUser.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

module.exports = {
  getUser,
  refreshUserToken,
  // getUserBlogs,
  getBookMarks,
  addBookMark,
  deleteBookMark,
  updatePassword,
  loginUser,
  registerUser,
  logoutUser,
};
