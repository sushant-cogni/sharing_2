import mongoose from "mongoose"

export const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected");
    }catch(err){
        console.log(`Database not Connected ! Reason: ${err.message}`);
    }
}   