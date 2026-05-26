const mongoose= require("mongoose")

const userSchema = mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
},{
    timestamp:true
})


const User=mongoose.model("user",userSchema)
module.exports= User

