

const Movie = require("../models/Movie.js")
const User=require("../models/User.js")

const addMovie = async(req,res) =>{
    try{
        const { title, addedBy} = req.body

        const user= await User.findById(addedBy)
        if(!user)
            return res.status(400).json({message:"Sign in correctly"})

        const isduplicateMovie = await Movie.findOne({title})
        // console.log(isduplicateMovie)
        if(isduplicateMovie)
            return res.status(400).json({message:"This movie already exists"})

        const movieData= await Movie.create({
            ...req.body
        })

        res.status(200).json({message:movieData})
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

const getMovies = async(req,res) =>{
    
    try{
        const movies=await Movie.find()

        if(movies.length<=0)
            return res.status(400).json({message:"No movies Available to view"})

        res.status(200).json({message:movies})
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

const updateMovie = async(req,res) =>{
    
    try{

        let title= req.params.title
        title=title.replace("+"," ")

        const {reqUser} = req.body

        const user= await User.findById(reqUser)
        if(!user)
            return res.status(400).json({message:"Sign in correctly"})

        const isduplicateMovie = await Movie.findOne({title})
        // console.log(isduplicateMovie)
        if(!isduplicateMovie)
            return res.status(400).json({message:"This movie doesn't exists"})


        if(isduplicateMovie.addedBy.toString() !== user._id.toString())
            return res.status(403).json({message:user.name.toString()+", You are not authorized to modify this movie"})

        const movieData= await Movie.findByIdAndUpdate(
            isduplicateMovie._id,
            {...req.body},
            {new:true}
        )

        res.status(200).json({message:movieData})

    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

const removeMovie = async(req,res) =>{
    
    try{

        let title= req.params.title
        title=title.replace("+"," ")

        const {reqUser} = req.body

        const user= await User.findById(reqUser)
        if(!user)
            return res.status(400).json({message:"Sign in correctly"})

        const isduplicateMovie = await Movie.findOne({title})
        // console.log(isduplicateMovie)
        if(!isduplicateMovie)
            return res.status(400).json({message:"This movie doesn't exists"})


        if(isduplicateMovie.addedBy.toString() !== user._id.toString())
            return res.status(403).json({message:user.name.toString()+", You are not authorized to remove this movie"})

        await isduplicateMovie.deleteOne()

        res.status(200).json({message:"Movie Removed"})
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

const getMovie = async(req,res) =>{
    
    try{

        let title= req.params.title
        title=title.replace("+"," ")
        const movie=await Movie.findOne({title})

        if(!movie)
            return res.status(400).json({message:"Movie is not available"})

        res.status(200).json({message:movie})
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

module.exports={
    addMovie,
    getMovies,
    getMovie,
    updateMovie,
    removeMovie
}