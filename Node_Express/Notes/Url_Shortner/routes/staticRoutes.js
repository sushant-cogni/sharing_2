const express= require("express")
const URL = require("../models/URL")
const { decode } = require("jsonwebtoken")
const router= express.Router()


router.get("/",async(req,res)=>{

    if(req.cookies && req.cookies.token){
        const user= decode(req.cookies?.token)
        const {id:userId} = user
        const allUrls = await URL.find({userId})
        res.render('home',{urls:allUrls})
    }
    else{
        res.render('home',{urls:[]})
    }
})

router.get("/",async(req,res)=>{
    res.render('signup')
})

router.get("/login",async(req,res)=>{
    res.render('login')
})

module.exports= router