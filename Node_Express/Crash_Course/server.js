// ==========================================
// 1. IMPORTING DEPENDENCIES (MODULES)
// ==========================================
// In Node.js, 'require()' is the CommonJS way to load external packages.

// 'express' is the core web framework. It acts as a wrapper around Node's
// built-in 'http' module, making it much easier to handle routing and responses.
const express = require("express");

// 'dotenv' is a security and configuration tool. It allows you to keep sensitive
// data (like database passwords or port numbers) in a hidden '.env' file
// instead of hardcoding them directly into your public code.
const dotenv = require("dotenv");

// 'chalk' is purely for the Developer Experience (DX). It styles your terminal
// text (colors, bolding) to make your server logs easier to read.
const chalk = require("chalk");


const {connectDB, disconnectDB} = require("./config/db.js");
const authRouter = require("./routes/authRoutes.js");

// ==========================================
// 2. CONFIGURATION & INITIALIZATION
// ==========================================

// This specific method tells 'dotenv' to look for a file named '.env' in your
// root folder, parse it, and load those variables into Node's global
// 'process.env' object.
dotenv.config();

// By calling express(), we initialize our application. The 'app' variable
// now holds an object packed with all the methods we need to build a server
// (like app.get, app.post, app.use, and app.listen).
const app = express();
app.use(express.json())
// We retrieve the port number from our environment variables.
// Note: When you deploy to production (like AWS or Render), the hosting
// provider will dynamically inject their own PORT into process.env.PORT.
const port = process.env.PORT;

// ==========================================
// 3. STARTING THE SERVER
// ==========================================

// app.listen() binds your application to the specified network port and tells
// Node to start actively "listening" for incoming HTTP traffic.
// The second argument is a callback function that executes exactly once
// the moment the server successfully starts.
app.listen(port, () => {
  // Logging a success message using chalk for formatting.
  console.log(chalk.bold(" Server is running on ", port, " "));
});

// ==========================================
// 4. DEFINING ROUTES (ENDPOINTS)
// ==========================================

// app.get() tells the server how to handle an HTTP GET request (the default
// request a browser makes when you visit a URL).
// Argument 1: '/' represents the "root" or home path (e.g., http://localhost:5001/)
// Argument 2: A callback function containing 'req' (Request) and 'res' (Response).
app.get("/", (req, res) => {
  // res.json() is an Express helper method. It does three things at once:
  // 1. Converts your JavaScript object into a valid JSON string.
  // 2. Automatically sets the HTTP headers to 'Content-Type: application/json'.
  // 3. Sends the response back to the client/browser.
  res.json({ message: "Shri Ganeshay namah" });

  // This logs to YOUR server terminal, not the user's browser. It's great
  // for debugging to confirm the route was actually hit.
  console.log("Get request came");
});

// This defines a second endpoint. It only triggers if the user specifically
// navigates to http://localhost:PORT/hello
app.get("/hello", (req, res) => {
  // The 'req' object contains data about the incoming request (like URL parameters,
  // user IP address, or headers), while 'res' provides the tools to send data back.
  res.json({ message: "Shri Swami Samarth" });
  console.log("Get request came");
});


// ==========================================
// 4. IMPORTING & MOUNTING THE ROUTER
// ==========================================

// We use 'require' with a relative file path ("./") to pull in the router
// we just exported from our custom file.
const accessRouter = require("./routes/accessRoute.js");
const watchListRouter = require("./routes/watchListRoutes.js");
const moviesRouter = require("./routes/moviesRouter.js");

// app.use() is used to mount middleware or routers.
// Argument 1: The base URL path ("/access").
// Argument 2: The router object to handle that path (accessRouter).
//
// How this works: Any incoming request that starts with '/access'
// (e.g., GET /access, POST /access) is caught here and handed off
// to the accessRouter to figure out what to do next.
app.use("/access", accessRouter);
app.use("/auth",authRouter)
app.use("/watchlists", watchListRouter)
app.use("/movies", moviesRouter)


connectDB();
// disconnectDB();