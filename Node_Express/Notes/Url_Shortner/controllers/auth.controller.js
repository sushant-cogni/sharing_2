const User = require("../models/User")
const { genrateToken } = require("../utils/jwt")

const signup = async(req,res) =>{
    // console.log(req.body)
    
    try{
        await User.create({
            ...req.body
        })

        return res.status(201).json({messge:"Signed up"})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err.message})
    }

}

const login = async(req,res) =>{
    // console.log(req.body)
    try{

        const {email,password} = req.body
        const user = await User.findOne({email})

        // console.log(password)

        if(!user){
            console.log("User not found")
            return res.status(404).json({message:"User not found"})
        }

        if(password!=user.password){
            console.log("Wrong Password")
            return res.status(404).json({message:"Wrong Password"})
        }

        const token = genrateToken(user.id,req.body)

        res.cookie("token",token,{
            maxAge: 1000*60*15,
            httpOnly:true,
            secure:true,
            domain:"localhost"
        })

        // return res.status(200).json({messge:token})
        return res.render("home")
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err.message})
    }
}

module.exports = {
    signup,
    login
}