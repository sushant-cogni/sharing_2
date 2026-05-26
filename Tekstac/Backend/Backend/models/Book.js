import { Schema,model } from "mongoose";

const bookSchema = Schema({
    auther:{
        type:String,
        required:true
    },
    bookImgURL:{
        type:String,
        default:"/uploads/books/default.png"
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    category:{
        type:String,
        required:true,
        enum:["Drama", "Fiction", "Comedy", "Philosophy", "Horror", "Thriller", "Art", "Science"]
    },
    language:{
        type:String,
        default:"English"
    }
},{
    timestamps:true
});

export default model("Book",bookSchema);