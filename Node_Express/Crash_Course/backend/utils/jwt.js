const jwt = require("jsonwebtoken")

const generateToken = (userId,res) =>{

    const payload= { id: userId }

    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRY || "7d"
    })

    res.cookie("jwt",token,{
        httpOnly:true,
        secure: process.env.NODE_ENV==="PRODUCTION",
        sameSite:"strict",
        maxAge: (1000*60*60*24)*7
    })

    return token
}

module.exports={
    generateToken
}