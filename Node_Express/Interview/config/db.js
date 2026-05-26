const mongoose = require("mongoose");

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongodb is connected")
    }catch(err){
        console.log(err.measage);
    }
}

module.exports = {
    connectDB
}