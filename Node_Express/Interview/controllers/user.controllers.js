const { User } = require("../models/User");

const getUsers = async(req,res) =>{
    try{
        const users = await User.find();

        return res.status(200).send(users)

    }catch(err){
        console.log(err.message);
        return res.status(500).send({
            status:"erroe",
            message:err.message
        })
    }
}

const insertUsers = async(req,res) => {
    try{
        await User.insertMany(req.body);

        return res.status(200).send({
            status:"success",
            message:"Users Inserted"
        })

    }catch(err){
        console.log(err.message);
        return res.status(500).send({
            status:"error",
            message:err.message
        })
    }
}

module.exports = {
    getUsers,
    insertUsers
}