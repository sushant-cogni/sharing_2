
// import jwt from jsonwebtoken
const jwt=require("jsonwebtoken")
const User = require("../models/User")


const genrateToken = (id,user) =>{

    const payload = {
        id,
        ...user
    }

    return jwt.sign(payload,process.env.SECRET_KEY)
}

const verifyToken = async(token,data) =>{
    const user= jwt.verify(token,process.env.SECRET_KEY)
    console.log(user.id)

    const findUser= await User.findById(user.id)

    console.log(findUser.id)

    return findUser &&  findUser.id,toString() == user.id.toString()
}

const decode = (token) =>{
    const user= jwt.verify(token,process.env.SECRET_KEY)
    // console.log(user.id)
    return user
}

module.exports = {
    genrateToken,
    verifyToken,
    decode
}