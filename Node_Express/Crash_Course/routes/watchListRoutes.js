const express = require("express")
const { addToWatchList, getWatchList, removeWatchList, updateWatchList } = require("../controllers/watchListController")
const tokenAuthorizer = require("../middleware/tokenMiddleware")
const WatchListValidate = require("../middleware/WatchListValidate")
const WatchListValidationSchema = require("../validators/WatchListValidationSchema")

const watchListRouter=express.Router()

watchListRouter.use(tokenAuthorizer)

watchListRouter.post("/",WatchListValidate(WatchListValidationSchema),addToWatchList)
watchListRouter.delete("/:id",removeWatchList)
watchListRouter.get("/:user",getWatchList)
watchListRouter.put("/:id",updateWatchList)

module.exports=watchListRouter