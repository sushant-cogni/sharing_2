const http=require("http")
const fs=require("fs")
const url=require("url")


const serverHandler = (req,res) =>{
    if(req.url==="/favicon.ico")
        return res.end("")

    const log= `${new Date().toDateString()}: ${req.url} : ${req.method} :Request recieved\n`

    const myUrl=url.parse(req.url,true)

    console.log(myUrl)

    fs.appendFile("log.txt", log, (err,data)=>{

        const reqMethod=req.method

        if(err)
            console.log(err)
        else {
            switch(myUrl.pathname){
                case "/":
                    if(reqMethod === "GET")
                        res.end("Homepage")
                    break
                case "/about":
                    if(reqMethod === "GET"){
                        const name=myUrl.query.name
                        res.end(`Hi ${name}`)
                    }
                    break
                case "/contact":
                    if(reqMethod === "GET")
                        res.end("Contact")
                    break
                case "/dashboard":
                    if(reqMethod === "GET")
                        res.end("Dashboard")
                    break
                case "/signup":
                    if(reqMethod === "GET")
                        res.end("Sign Up Form")
                    else if(reqMethod === "POST")
                        res.end("Sign Up submitted")
                    break
                default:
                    res.end("404 Not Found")
            }
        }
    })
}
const server=http.createServer(serverHandler)

server.listen(8000,()=> console.log("Server Started"))