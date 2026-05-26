const express = require("express");
const { getProducts, insertProducts } = require("../controllers/product.controllers");

const productRouter = express.Router();

productRouter.get("/",getProducts);
productRouter.post("/",insertProducts);

module.exports = productRouter