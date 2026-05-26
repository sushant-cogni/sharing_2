const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Audio", "Wearables", "Accessories", "Storage"],
    },
    isAvailable: {
      type:Boolean,
      required: true,
    },
    price: {
      type:Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product",productSchema)

module.exports={
    Product
}