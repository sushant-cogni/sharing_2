import { Schema,model, Types } from "mongoose";
import {User} from "#models";

const favBookItemSchema = Schema({
    userId:{
        type:Types.ObjectId,
        ref:User,
        required:true
    }, 
    bookId:{
        type:String,
        required:true
    }  
},{
    timestamps:true
});

export default model("FavBookItemSchema",favBookItemSchema);