const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
      required: true,
    },
    Password: {
      type:String,
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User",userSchema)

module.exports={
    User
}