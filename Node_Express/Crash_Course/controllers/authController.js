
const User = require('../models/User.js')
const {encrypt, compare} = require("../config/encrypt.js")
const { generateToken } = require('../utils/jwt.js')


const register = async(req,res) => {
    
    try{    
        const {name , email, password }= req.body

        const userExists= await User.findOne({email});

        if(userExists)
            res.status(409).json({message:"User already exists"})
        
        const user= await User.create({
            name,
            email,
            password: await encrypt(password)
        })

        res.status(201).json(user)

        // login(req,res)
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            Error:error.message
        })
    }
}

const login = async(req,res) =>{
    try{
        const { email, password} = req.body

        const user = await User.findOne({email})

        if(!user)
            res.status(401).json({message:"User not exists"})

        const isValid= await compare(password,user.password)

        if(!isValid)
            res.status(401).json({message:"Password is wrong"})

        const token = generateToken(user._id,res)

        res.status(201).json({
            status:"success",
            data: user,
            token
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            Error:error.message
        })
    }
}

const logout = (req,res) =>{

    res.cookie("jwt","",{
        httpOnly:true,
        expires: new Date(0)
    })

    res.status(400).json({
        status:"success",
        message:"Logged out"
    })
}

module.exports = {
    register,
    login,
    logout
}