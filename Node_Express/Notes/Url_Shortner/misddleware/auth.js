const { verifyToken } = require("../utils/jwt")


const authenticate = (req,res,next) =>{

    let token=null

    // console.log(req.cookies)
    if(req.headers && req.headers.authorization)
        token = req.headers.authorization.split(" ")[1]

    if(req.cookies && req.cookies.token)
        token = req.cookies.token

    let user
    if(token)
        user = verifyToken(token,req.body)

    if(user){
        req.user=user
        next()
    }
    else {
        // res.status(403).json({message:"not Authorized"})
        res.render("login")
    }
}

module.exports= authenticate