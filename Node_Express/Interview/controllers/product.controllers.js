const { Product } = require("../models/Product");

const getProducts = async(req,res) =>{
    try{
        const products = await Product.find();

        return res.status(200).send(products)

    }catch(err){
        console.log(err.message);
        return res.status(500).send({
            status:"erroe",
            message:err.message
        })
    }
}

const insertProducts = async(req,res) => {
    try{
        await Product.insertMany(req.body);

        return res.status(200).send({
            status:"success",
            message:"Products Inserted"
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
    getProducts,
    insertProducts
}