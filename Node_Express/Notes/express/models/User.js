const mongoose=require("mongoose")

// Schema for MongoDB Model
const userSchema= mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        default:"LNU"
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    gender:{
        type: String
    },
    job_title:{
        type:String
    }

})

// MongoDB Model
const User=mongoose.model('User',userSchema)

module.exports= User