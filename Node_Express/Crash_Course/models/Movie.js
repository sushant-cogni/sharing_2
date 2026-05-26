const mongoose = require("mongoose")
const { required } = require("zod/mini")

const MovieSchema= mongoose.Schema({
    title: { 
        type: String, 
        unique:true,
        required: true 
    },
    overview: { 
        type: String 
    },
    year: { 
        type: Number, 
        required: true 
    },
    genres: { 
        type: [String], 
        default: [] 
    },
    runtime: { 
        type: Number 
    },
    posterUrl: { 
        type: String 
    },
    creator:{
        type:String
    },
    addedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        required:true,
        ref: 'User' 
    }
},{
    timestamps:true
})

// export default mongoose.model("Movie",MovieSchema)
module.exports= mongoose.model("Movie",MovieSchema)