const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    }
},{
    timeStamps:true
})

// export default mongoose.model("User",UserSchema)
module.exports= mongoose.model("User",UserSchema)
