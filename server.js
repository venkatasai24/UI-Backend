const express = require("express");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoute");
const blogRouter = require("./routes/blogRoute");
const { handleError } = require("./middleware/error");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Middleware to log route and method
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

//routes
app.use("/", blogRouter);
app.use("/users", userRouter);

//error-handling
app.use(handleError);

//start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
