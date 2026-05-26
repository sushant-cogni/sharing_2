import { requiredLogin } from "#middlewares"
import mongoose from "mongoose"

const commentSchema = mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    commentedBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    blogId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"blogs"
    }
})

export default mongoose.model("Comment",commentSchema)