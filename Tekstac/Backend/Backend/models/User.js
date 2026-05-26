import {Schema,model} from "mongoose";

const userSchema = Schema({
    username:{
        required:true,
        type:String,
        unique:true
    },
    email:{
        required:true,
        type:String,
        unique:true
    },
    password:{
        required:true,
        type:String
    }
},{
    timestamps:true
});

export default model("User",userSchema);