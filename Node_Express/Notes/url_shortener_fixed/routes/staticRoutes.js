const express = require("express")
const URL = require("../models/URL")
const { decode } = require("../utils/jwt") // Was wrongly importing from "jsonwebtoken"
const router = express.Router()

router.get("/", async (req, res) => {
    if (req.cookies && req.cookies.token) {
        try {
            const user = decode(req.cookies.token)
            const { id: userId } = user
            const allUrls = await URL.find({ userId })
            return res.render("home", { urls: allUrls })
        } catch (err) {
            return res.render("home", { urls: [] })
        }
    } else {
        res.render("home", { urls: [] })
    }
})

// Was a duplicate router.get("/") — fixed to /signup
router.get("/signup", async (req, res) => {
    res.render("signup")
})

router.get("/login", async (req, res) => {
    res.render("login")
})

module.exports = router
