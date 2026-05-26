const express=require("express")
const { addMovie, getMovies, updateMovie, removeMovie, getMovie } = require("../controllers/moviesController")
const tokenAuthorizer = require("../middleware/tokenMiddleware")

const moviesRouter=express.Router()

moviesRouter.use(tokenAuthorizer)

moviesRouter.post("/",addMovie)
moviesRouter.get("/",getMovies)
moviesRouter.put("/:title",updateMovie)
moviesRouter.delete("/:title",removeMovie)
moviesRouter.get("/:title",getMovie)

module.exports = moviesRouter