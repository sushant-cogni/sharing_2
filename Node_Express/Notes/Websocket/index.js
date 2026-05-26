import express from "express"
import http from "http"
import {Server} from "socket.io"
import path from "path"

const app = express()
app.use(express.static("./public"))

const server =http.createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {}
})


server.listen(9001,()=>{
    console.log(`Server is runnning on ${9001}`)
})

app.get("/",(req,res) => {
    return res.sendFile(path.resolve("/index.html"))
})

io.on("connection",(clientSocket) => {
    console.log("connected",clientSocket.id)

    clientSocket.on("chat message",(msg)=>{
        console.log(msg)
        io.emit('client message', "Thanks");
    })

})