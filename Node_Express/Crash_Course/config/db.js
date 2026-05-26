// ==========================================
// 1. DATABASE CONFIGURATION SETUP
// ==========================================

// Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.
// It manages relationships between data, provides schema validation, and is
// used to translate between objects in code and the representation of those
// objects in MongoDB.
const mongoose = require("mongoose");

// Connecting to a database takes time (network latency, authenticating, etc.),
// so we MUST use an 'async' function. This allows us to use 'await' inside.
const connectDB = async () => {
  // We wrap our connection logic in a try/catch block. If the database is
  // down or the password in the URL is wrong, it will "catch" the error
  // instead of crashing the app silently.
  try {
    // Fetching the connection string (URI) from our secure .env file.
    const url = process.env.ATLAS_URL;

    // 'await' tells Node.js: "Pause this function right here until Mongoose
    // successfully connects to the database."
    const con = await mongoose.connect(url);

    // Once connected, we log a success message. 'con.connection.host' is
    // helpful to confirm whether you connected to your local database or
    // a production cloud database (like MongoDB Atlas).
    console.log(
      "Database Connected to " +
        con.connection.host +
        ":" +
        con.connection.port,
    );
  } catch (error) {
    // If anything goes wrong, this block executes.
    console.error(`Database connection error: ${error.message}`);

    // process.exit(1) forcefully shuts down your Node.js server.
    // The '1' means "exit with a failure code". This is good practice:
    // if your app requires a database to function, it shouldn't keep
    // running if the database connection fails.
    process.exit(1);
  }
};

// A function to cleanly disconnect from the database. This is especially
// useful for writing automated tests, where you need to open and close
// connections repeatedly without leaving them hanging.
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Database Disconnected");
  } catch (error) {
    console.error(`Database disconnection error: ${error.message}`);
    process.exit(1);
  }
};

// Exporting both functions using CommonJS format so they can be imported
// into your main server file (like app.js) and executed before app.listen().
module.exports = {
  connectDB,
  disconnectDB,
};
