import mongoose from "mongoose"

export const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected")
    }catch(err){
        console.log(`Database not connected \n${err}`)
    }
}