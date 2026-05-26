const Movie = require("../models/Movie")
const User = require("../models/User")
const WatchListItem = require("../models/WatchListItem")


const addToWatchList = async(req,res) =>{
    try{
        const {user,movie,status,notes,rating} = req.body
        const isValid= await Movie.findById(movie)
        if(!isValid){
            console.log("Movie doesn't exits")
            return res.status(404).json({message:"Movie doesn't exists"})
        }

        const isValidUser= await User.findById(user)
        if(!isValidUser){
            console.log("User doesn't exits")
            return res.status(404).json({message:"User doesn't exists"})
        }

        const existWatchList = await WatchListItem.findOne({
            movie,
            user
        })

        if(existWatchList){
            console.log("Movie is in watchlist already")
            return res.status(401).json({message:"Movie is in watchlist already"})
        }

        const newMovie= await WatchListItem.create({
            user,
            movie,
            status: status || "PLANNED",
            notes,
            rating
        })

        res.status(201).json(newMovie)

    }catch(error){
        console.log("error : ",error.message)
        res.status(500).json({
            "error":"Server Error",
            message:error.message
        })
    }
}

const removeWatchList = async(req,res) =>{
    try{
        const watchListItem = await WatchListItem.findById(req.params.id)

        if(!watchListItem){
            return res.status(404).json({message:"Watchlist item not found"})
        }

        // console.log(watchListItem.user.toString())
        // console.log(req.user._id.toString())

        if(watchListItem.user.toString()!== req.user._id.toString())
            return res.status(403).json({message:"Not authorized to delete this item"})

        await watchListItem.deleteOne()

        return res.json({message:"Success"})
    }catch(error){
        console.log("error : ",error)
        res.status(500).json({
            "error":"Server Error",
            message:error.message
        })
    }
}

const updateWatchList = async(req,res) =>{
    try{
        const { status, rating, notes } = req.body

        const watchlistItem= await WatchListItem.findById(req.params.id)

        if(!watchlistItem)
            return res.status(404).json({message:"Watchlist item not found"})

        // console.log(watchlistItem.user)
        // console.log(req.user.id)

        if(watchlistItem.user.toString()!== req.user._id.toString())
            return res.status(403).json({message:"Not authorized to update this item"})

        const UpdatedItem=await WatchListItem.findByIdAndUpdate(
            req.params.id,
            {status , rating, notes},
            {new : true}
        )
        res.status(200).json({ status: "success", data: updateWatchList });
    }catch(error){
        console.log("error : ",error)
        res.status(500).json({
            "error":"Server Error",
            message:error.message
        })
    }
}

const getWatchList = async(req,res) =>{
    try{

        const user = req.params.user

        console.log(user)

        const watchList=await WatchListItem.find({user})

        console.log(watchList)

        if(watchList.length <= 0)
            return res.status(400).json({message:"You haven't created your Watchlist"})

        res.status(200).json({watchlist:watchList})
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:"Server Error",
            error:error.message
        })
    }
}

module.exports = {
    addToWatchList,
    getWatchList,
    removeWatchList,
    updateWatchList
}