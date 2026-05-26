const mongoose = require("mongoose")

const connectDB = async () =>{
    try{
        await mongoose.connect("mongodb://localhost:27017/url_shortner")
        console.log("Database Connected")
    }catch(err){
        console.log(err)
    }
}


module.exports = connectDB