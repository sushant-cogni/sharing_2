const { User } = require("../models/User");
const bcrypt = require("bcryptjs")


const register = async(req,res) => {
    try{
        const {name,email,Password} = req.body;
        const exists= await User.findOne({email});

        if(exists){
            return res.status(400).send("User already exists")
        }

        const hashedPassword = await bcrypt.hash(Password,10)

        const user = await User.create({
            name,
            email,
            Password : hashedPassword
        })
        
        return res.status(201).send(user.toObject())

    }catch(err){
        console.log(err.message);
        return res.status(500).send({
            status:"error",
            message:err.message
        })
    }
}

const login = async(req,res) => {
    try{

        const {email,Password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(400).send("User not exists")
        }

        const isValid = await bcrypt.compare(Password,user.Password)

        if(isValid)
            return res.status(201).send({
                status:"Logged in"
            })
        else
            return res.status(400).send({ error : "Invalid Password"})

    }catch(err){
        console.log(err.message);
        return res.status(500).send({
            status:"error",
            message:err.message
        })
    }
}

module.exports={
    register,
    login
}