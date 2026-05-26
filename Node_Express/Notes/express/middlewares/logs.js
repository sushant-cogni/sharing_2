const fs = require('fs')

const logs = (req,res,next)=>{

    // this can have access to the actual req,res data.
        // console.log(req,"\n",res)
    // this can add anything in the req,res objects 
    // that will be easily accessed by next over middlewares or functions
        // req.user= Something....
    
    fs.appendFile("logs.txt",`${new Date().toDateString()} : ${req.method} : ${req.path} : ${req.ip=="::1"?"localhost":req.ip} \n`,(err,data)=>{
        if(!err){
            console.log("Logs Updated")
            next()
        }
    })
}

module.exports=logs