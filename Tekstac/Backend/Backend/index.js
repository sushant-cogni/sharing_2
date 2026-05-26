import express from "express";
import {config} from "dotenv";
import  {connectDB}  from "#config";
import {bookRouter, userRouter} from "#routes";

config();
const app= express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

(async()=>{await connectDB();})()

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server Started at PORT:${PORT}`);
})


app.use("/api/auth/",userRouter)
// app.use("/api/books/",bookRouter)

app.use((error,req,res,next)=>{
    // const status=error.statusCode || 500;

    // console.log(error.stack);
    // console.log(error.message);

    // if(error.isOperational){
    //     return res.status(status).send({
    //         status:error.type,
    //         message:error.message
    //     });
    // }

    return res.status(500).send({
        status:"UNEXPECTED ERROR",
        message:error.message
    });
})