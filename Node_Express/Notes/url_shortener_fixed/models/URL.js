const mongoose= require("mongoose")
const User = require("./User")

const urlSchema = mongoose.Schema({
    shortId:{
        type:String,
        unique:true,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    history:[{timestamp: {type:Number} }]
},{
    timestamps:true
})



const URL=mongoose.model("urls",urlSchema)
module.exports= URL

