import jwt from "jsonwebtoken"


export const generateAccessToken = (payload) => {
    return jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: 1000*60*60*15
    })
}

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: "7d"
    })
}

export const verifyAccessToken = (token) => {
    return jwt.verify(token,process.env.JWT_SECRET,{
        maxAge:1000*60*60*15
    })
}

export const verifyRefreshToken = (token) => {
    return jwt.verify(token,process.env.JWT_SECRET,{
        maxAge:"7d"
    })
}

