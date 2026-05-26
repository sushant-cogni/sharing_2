const express = require("express");
const { getUsers, insertUsers } = require("../controllers/user.controllers");

const userRouter = express.Router();

userRouter.get("/",getUsers);
userRouter.post("/",insertUsers);

module.exports = userRouter