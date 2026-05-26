const dotenv = require("dotenv");
dotenv.config(); // Must be FIRST — before anything reads process.env

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectDB = require("./utils/db");
const urlRouter = require("./routes/urls");
const staticRouter = require("./routes/staticRoutes");
const authRouter = require("./routes/authRoutes");
const authenticate = require("./misddleware/auth");

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // extended:true is required
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Public routes — no auth needed
app.use("/auth", authRouter);


app.use(authenticate);
app.use("/", staticRouter); // staticRouter was imported but never mounted!

// Protected routes — authenticate all routes below this line
app.use("/url_shortner", urlRouter);

app.listen(8001, () => {
    console.log("Server Started on port 8001");
});