import mongoose from "mongoose";
import crypto from "crypto";
import { generateToken } from "#utils";

const userSchema = mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    salt:{
        type:String,
    },
    profileImageURL:{
        type:String,
        default:"/images/default.png"
    },
    role:{
        type:String,
        enum:["User","Admin"],
        default:"User"
    }
})


userSchema.pre("save",async function (next){
    const user = this

    if(!user.isModified("password"))
        return next()

    const salt = crypto.randomBytes(16).toString('hex')

    const hashedPassword = crypto.createHmac("sha256",salt).update(user.password).digest("hex")

    user.salt = salt
    user.password = hashedPassword
})

userSchema.statics.matchPassword = async function(user, password){

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = crypto.createHmac('sha256', salt)
        .update(password)
        .digest('hex');
        
    if(hashedPassword != userProvidedHash)
        return false;

    user.password = undefined;
    user.salt = undefined;

    const token = generateToken(user)

    return token
}

export default mongoose.model("User",userSchema)