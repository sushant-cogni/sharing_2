const shortid = require("shortid")
const URL = require("../models/URL.js")
const { decode } = require("jsonwebtoken")

const generateURL= async(req,res) => {

    try{

        const {url} = req.body

        const {id:userId} = req.user

        const urlData = await URL.create({
            shortId: shortid(),
            url,
            userId,
            history:[]
        })

        // res.json({
        //     message:"Success",
        //     id:urlData.shortId
        // })

        // const urls = await URL.find({})
        const urls = await URL.find({userId})

        res.render("home",{
            id:urlData.shortId,
            urls
        })

    }catch(err){
        console.log(err)
        res.json({error:err.message})
    }
    
}

const getAllURL= async(req,res) => {
    try{

        const urls = await URL.find({})
        
        res.json({message:"Success",urls})
    }catch(err){
        console.log(err)
        res.json({error:err.message})
    }
}

const getURL= async(req,res) => {
    try{

        const shortId = req.params.id

        const entry= await URL.findOneAndUpdate({
            shortId
        },{
            $push:{
                history: { timestamp : Date.now()},
            },
        })

        res.redirect(entry.url)

        // console.log(url.url)

        // res.json({
        //     message:"Success",
        //     data: url
        // })
    }catch(err){
        console.log(err)
        res.json({error:err.message})
    }
}

const analyseURL = async (req,res) =>{
    try{

        const shortId = req.params.id

        const entry= await URL.findOne({shortId})

        res.json({
            message:"Success",
            total_clicks:entry.history.length,
            history:entry.history
        })

    }catch(err){
        console.log(err)
        res.json({error:err.message})
    }
}

module.exports = {
    generateURL,
    getAllURL,
    getURL,
    analyseURL
}