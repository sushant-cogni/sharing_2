const express = require("express")
const ejs = require('ejs');
const path = require("path")
const connectDB = require("./utils/db");
const urlRouter = require("./routes/urls");
const staticRouter = require("./routes/staticRoutes");
const authRouter = require("./routes/authRoutes");
const URL = require("./models/URL");
const dotenv = require("dotenv");
const authenticate = require("./misddleware/auth");
const cookieParser = require("cookie-parser");
const { decode } = require("./utils/jwt");

connectDB()



const app = express()

app.listen(8001,()=>{
    console.log("Server Started")
})

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())

dotenv.config()

app.set("view engine","ejs")
app.set("views",path.resolve("./views"))

app.use("/url_shortner", urlRouter)
app.use("/auth", authRouter)

app.use(authenticate)

// Server Side Rendering
app.get("/",async(req,res)=>{

    console.log(req.user)
    const {id:userId} = req.user
    const allUrls = await URL.find({userId})
    res.render('home',{urls:allUrls})
})

app.get("/signup",async(req,res)=>{
    res.render('signup')
})

app.get("/login",async(req,res)=>{
    res.render('login')
})