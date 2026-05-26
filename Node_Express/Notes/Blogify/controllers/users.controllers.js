import { userServices } from "#services";
import {User} from "#models";
import { formDoc } from "#utils";

export const signUpController = async(req,res) => {
    
    try{
        const {email} = req.body

        if(await userServices.findUserByEmail(email))
            return res.status(400).json({message:"User already exists"})

        const user = await userServices.saveUser(req.body)

        return res.status(201).redirect("/")
    }catch(err){
        console.log(err)
        return res.status(500).json({message:err.message})
    }
}

export const signInController = async(req,res) => {
    try{    

        const {email,password} = req.body

        const user = await userServices.findUserByEmail(email)

        if(!user)
            return res.status(400).json({message:"Invalid Username"})

        
        const token = await User.matchPassword(user, password);
        
        if(!token)
            return res.status(404).json({message:"Invalid Credentials"})

        res.cookie("token",token)

        return res.redirect("/")

    }catch(err){
        console.log(err)
        return res.status(500).json({message:err.message})
    }
}


export const logoutController = (req,res) =>{
    try{
        res.clearCookie("token")
        return res.redirect("/")
    }catch(err){}
}