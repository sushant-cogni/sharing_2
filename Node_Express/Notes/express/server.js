const express = require("express")

const connectDB = require("./utils/db")
const logs = require("./middlewares/logs")
const {getAllUsersInHTML} = require("./controllers/users")
const userRouter = require("./routes/userRouter")

const app=express()

// Connecting to the MongoDB
connectDB()

// Middlewares to recieve the data in specific format
// Here express.urlencoded() is the middleware function 
// that imports the received urlencoded data into req.body
app.use(express.urlencoded({extended:false}))
// After calling next() from previous middleware function this middleware will run
// Here express.json() is the middleware function 
// that imports the received json data into req.body
app.use(express.json())

// Middleware example
app.use(logs)

// responding as HTML
app.get("/users",getAllUsersInHTML)

// api means rest api for all applications like websites, webapps, applications,etc.
app.use("/api/users", userRouter)


app.listen(8000,()=>{
    console.log("Server Started")
})

