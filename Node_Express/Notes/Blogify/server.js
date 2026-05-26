import express from "express"
import {config} from "dotenv"
import {connectDB, printlogs}  from "#utils"
import path from "path"
import {blogsRoutes, usersRoutes} from "#routes"
import cookieParser from  "cookie-parser"
import { Authenticate } from "#middlewares"
import { Blog } from "#models"


config()

const app = express()
app.listen(process.env.PORT || 5000, ()=>{
    console.log(`Server Started at PORT : ${process.env.PORT}`)
})

connectDB()

app.set("view engine","ejs")
app.set("views",path.resolve("./views"))

app.use(printlogs)
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.resolve("./public")))

app.use(Authenticate)

app.get("/signup",(req,res) => {
    return res.render("signup",{
        user:req.user
    })
})

app.get("/signin",(req,res) => {
    return res.render("signin",{
        user:req.user
    })
})

app.use("/auth",usersRoutes)

app.get("/", async (req, res) => {
    const blogs = await Blog.find({}).sort({ createdAt: -1 })
    return res.render("home", {
        user: req.user,
        blogs
    })
})

app.use("/blog",blogsRoutes)

