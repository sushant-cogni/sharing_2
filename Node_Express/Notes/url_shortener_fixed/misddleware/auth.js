const { verifyToken } = require("../utils/jwt")

// Must be async to await verifyToken
const authenticate = async (req, res, next) => {

    let token = null

    if (req.headers && req.headers.authorization)
        token = req.headers.authorization.split(" ")[1]

    if (req.cookies && req.cookies.token)
        token = req.cookies.token

    let user = null
    if (token) {
        try {
            user = await verifyToken(token) // verifyToken is async — must await!
        } catch (err) {
            user = null
        }
    }

    if (user) {
        req.user = user
        next()
    } else {
        res.render("login")
    }
}

module.exports = authenticate
