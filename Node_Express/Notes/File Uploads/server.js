const express = require("express")
const multer = require("multer")
const ejs = require("ejs")
const path = require("path")

const app = express()

// const upload = multer({dest:"uploads/"})

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        return cb(null,"./uploads/custom_upload_way")
    },
    filename:function(req,file,cb){
        return cb(null, Date.now()+ "-" +file.originalname)
    }
})
const upload = multer({storage:storage})

app.set("view engine","ejs")
app.set("views",path.resolve("./views"))

app.use(express.urlencoded({extended:false}))

app.listen(8002,()=>{
    console.log("Server started")
})

app.get("/",(req,res)=>{
    res.render("home")
})

app.post("/upload",upload.single("upload_file"),(req,res)=>{
    console.log(req.file)
    res.redirect("/")
})