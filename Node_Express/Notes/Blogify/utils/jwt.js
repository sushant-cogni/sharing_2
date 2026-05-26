import jwt from "jsonwebtoken"

export const generateToken = (user) =>{
    
    const {name,email,profileImgUrl,_id,role} = user
    
    const payload = {
        name,
        email,
        profileImgUrl,
        _id,
        role
    }

    const token = jwt.sign(payload,process.env.SECRET)
    return token
}

export const validateToken = (token) =>{
    return jwt.verify(token,process.env.SECRET)
}