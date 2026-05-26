const express= require("express")
const { getAllURL, getURL, generateURL, analyseURL } = require("../controllers/urls")

const router = express.Router()

// router.get("/",getAllURL)
router.get("/:id",getURL)
router.post("/",generateURL)
router.get("/analyse/:id",analyseURL)

module.exports = router