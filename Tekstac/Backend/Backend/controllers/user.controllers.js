import {userServices} from "#services"
import {apiErrors} from "#errors"
import { compareHash, hash, userDoc } from "#utils";
import { User } from "#models";
import { generateAccessToken, generateRefreshToken } from "#utils";

export const registerUser = async(req,res) => {
    try{   

        const {username,email,password} = req.body;

        const exists= await userServices.getUserByEmail(email);

        if(exists){
            return apiErrors("User Already Exists!",res,400);
        }

        const hashedPassword = await hash(password);

        const user = await User.create({
            username,
            email,
            password:hashedPassword
        })

        return res.status(201).send(userDoc(user.toObject()))

    }catch(err){
        return apiErrors(err.message,res,400)
    }
}

export const loginUser = async(req,res) => {
    try{   

        const {email,password} = req.body;

        const exists= await userServices.getUserByEmail(email);

        if(!exists){
            return apiErrors("User not Exists! , Please Register!",res,400);
        }

        const isValid = await compareHash(password,exists.password);
        
        if(!isValid){
            return apiErrors("Incorrect Password!",res,400)
        }

        const user = userDoc(exists.toObject())

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("Rt",refreshToken,{
            httpOnly:true,
            sameSite:true,
            maxAge:1000*60*60*24*7,
            secure:true
        })

        return res.status(201).send({
            ...user,
            accessToken
        })

    }catch(err){
        return apiErrors(err.message,res,400)
    }
}

