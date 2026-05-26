
const request = require("postman-request")
const dontenv=require("dotenv")
dontenv.config()

const forecast= (lat,long,callback) => {
    
    const link= process.env.URL;
    const accessKey= process.env.API_ACCESS_KEY;
    const query=lat+","+long;


    // const url= link+"?access_key="+accessKey+"&query="+query

    const url=process.env.WEBSITE_URL

    console.log(url)

    request({url:url,json:true},(error,response)=>{

        // console.log(response.body)

        if(error){
            return callback("Internal Error",undefined)
        }
        else if(response.body.error){
            return callback("Location Error",undefined)
        }
        else{
            return callback(undefined,response.body.current)
        }
    })

}

module.exports=forecast