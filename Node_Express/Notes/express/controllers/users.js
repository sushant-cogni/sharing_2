const User = require("../models/User.js")
const fs = require('fs')

// Mockaroo Mock Data
const users=require("../MOCK_DATA.json")

const getAllUsersInHTML = (req,res)=>{
    const html=`
        <ul>
            ${users.map( user => `<li>${user.first_name}</li>`).join("")}
        </ul>
    `
    return res.status(200).send(html)
}

const getAllUsers = async(req,res)=>{

    try{
        const users=await User.find({})
        return res.json(users)
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err.message})
    }
}

const createUser= async(req,res)=>{

    try{
        const user = await User.create({
            ...req.body
        })
        return res.status(201).json({status:"Success"})
    }catch(err){
        console.log(err)
        return res.status(500).json({error:err.message})
    }
    // users.push({...req.body, id: users.length + 1})
    // fs.writeFile("MOCK_DATA.json",JSON.stringify(users),(err,data)=>{
    //     if(!err)
    //         res.json({
    //             ...req.body, 
    //             id:users.length
    //         })
    // })
}

const getUser = async (req,res)=>{
        // const user= await users.find(u => u.id == req.params.id)
        // if(user)
        //     return res.json(user)
        // else 
        //     return res.json({message:"User doesn't exists"})

        try{
            const user=await User.findById(req.params.id)
            return res.status(201).json({user:user})
        }catch(err){
            console.log(err)
            return res.status(500).json({error:err.message})
        }
}

const updateUser = async(req,res)=>{

        // const updatedUsers=users.map( user =>{
        //     if(user.id==req.params.id){
        //         return {...user,...req.body}
        //     }
        //     else 
        //         return user
        // })

        // fs.writeFile("MOCK_DATA.json",JSON.stringify(updatedUsers),(err,data)=>{
        //     if(!err)
        //         return res.json({...req.body})
        // })
        try{
            await User.findByIdAndUpdate(req.params.id,{...req.body})
            return res.status(201).json({status:"Success"})
        }catch(err){
            console.log(err)
            return res.status(500).json({error:err.message})
        }
}

const deleteUser = async(req,res)=>{

        // const updatedUsers=users.filter(user => req.params.id != user.id )

        // fs.writeFile("MOCK_DATA.json",JSON.stringify(updatedUsers),(err,data)=>{
        //     if(!err)
        //         return res.json({message:"User Removed"})
        // })

        try{
            await User.findByIdAndDelete(req.params.id)
            return res.status(201).json({status:"Success"})
        }catch(err){
            console.log(err)
            return res.status(500).json({error:err.message})
        }

}

module.exports = {
    getAllUsersInHTML,
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
}