const User = require("../models/User")
const URL = require("../models/URL")
const { genrateToken } = require("../utils/jwt")

const signup = async (req, res) => {
    try {
        await User.create({ ...req.body })
        return res.status(201).json({ message: "Signed up" }) // Fixed typo: "messge"
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (password != user.password) {
            return res.status(401).json({ message: "Wrong Password" })
        }

        const token = genrateToken(user.id, { email })

        res.cookie("token", token, {
            maxAge: 1000 * 60 * 15,
            httpOnly: true,
            secure: false,  // Must be false for plain HTTP on localhost
        })

        // Fetch urls so home view doesn't crash
        const allUrls = await URL.find({ userId: user.id })
        return res.render("home", { urls: allUrls })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { signup, login }
