const express = require("express");
const ejs = require("ejs");
const {config} = require("dotenv");
const { connectDB } = require("./config/db");
const path = require("path");
const productRouter = require("./routes/product.routes");
const userRouter = require("./routes/user.routes");
const authRouter = require("./routes/auth.routes");


config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs")
app.set("views",path.resolve("./views"))

const PORT = process.env.PORT || 5000;

app.listen(PORT ,() => {
    console.log(`Server is running on : http://localhost:${PORT}/`)
})

connectDB();

app.use("/api/products",productRouter)
app.use("/api/users",userRouter)
app.use("/api/auth",authRouter)
app.get("/login",(req,res) => {
    res.render("login")
})
