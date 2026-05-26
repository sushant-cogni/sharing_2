
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

const verifyToken = async (token) => {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const findUser = await User.findById(decoded.id);

    // Bug was: "findUser.id,toString()" — comma operator made this always return
    // the result of toString(), not the comparison. Fixed below:
    if (findUser && findUser.id.toString() === decoded.id.toString()) {
        return findUser;  // Return the actual user object, not a boolean
    }
    return null;
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