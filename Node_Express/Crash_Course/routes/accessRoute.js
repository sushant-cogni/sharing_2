// ==========================================
// 1. ROUTER SETUP
// ==========================================

// We still need to require Express here because we are using its Router method.
const express = require("express");

// express.Router() creates a new router object. Think of it as a mini Express
// app. It can handle routes and middleware exactly like the main 'app', but
// it helps keep your project modular and clean.
const accessRouter = express.Router();

// ==========================================
// 2. HTTP METHODS (CRUD OPERATIONS)
// ==========================================
// These four methods correspond to standard REST API actions:
// GET (Read), POST (Create), PUT (Update), DELETE (Delete).

// GET: Typically used to fetch or "read" data.
// Note: The path here is just '/', but because of how we mount it in the
// main file later, the actual URL hit by the user will be '/access/'.
accessRouter.get("/", (req, res) => {
  res.json({
    httpMessage: "GET",
  });
});

// POST: Typically used to submit new data to the server (e.g., submitting a form).
accessRouter.post("/", (req, res) => {
  res.json({
    httpMessage: "POST",
  });
});

// PUT: Typically used to update or replace existing data entirely.
accessRouter.put("/", (req, res) => {
  res.json({
    httpMessage: "PUT",
  });
});

// DELETE: Exactly what it sounds like; used to delete data.
accessRouter.delete("/", (req, res) => {
  res.json({
    httpMessage: "DELETE",
  });
});

// ==========================================
// 3. EXPORTING THE MODULE
// ==========================================

// In Node.js, variables and functions in a file are private to that file by default.
// module.exports makes 'accessRouter' public so we can import it into our main app.js.
module.exports = accessRouter;
