const express = require("express")
const { getAllURL, getURL, generateURL, analyseURL } = require("../controllers/urls")

const router = express.Router()

// IMPORTANT: specific routes must come BEFORE wildcard /:id
// Otherwise /analyse/:id is caught by /:id and analyseURL is never reached
router.get("/analyse/:id", analyseURL)
router.get("/:id", getURL)
router.post("/", generateURL)

module.exports = router
