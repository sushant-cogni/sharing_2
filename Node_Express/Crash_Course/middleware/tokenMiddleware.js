const jwt=require("jsonwebtoken")
const User = require("../models/User")

const tokenAuthorizer = async(req,res,next) =>{

    let token=null

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
        token=req.headers.authorization.split(' ')[1]
    else if(req.headers.cookie)
        token=req.headers.cookie.split('=')[1]
    else if(req.cookies && req.cookies.jwt)
        token=req.cookies.jwt

    if(!token)
        return res.status(401).json({message:"Not authorized, no token provided"})

    try{
        const user=jwt.verify(token,process.env.JWT_SECRET)

        req.user = await User.findById(user.id)
        if(!req.user)
            res.status(401).json({message:"User no longer exists"})

        // console.log(token)
        next()
    }catch(error){
        console.log(error)
        res.status(500).json({error:error.message})
    }
}

module.exports=tokenAuthorizer