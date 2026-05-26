const express = require("express")
const { getAllUsers, createUser, getUser, updateUser, deleteUser } = require("../controllers/users")

const userRouter = express.Router()

userRouter.get("/", getAllUsers)
userRouter.post("/api/users", createUser)
userRouter.route("/:id")
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = userRouter