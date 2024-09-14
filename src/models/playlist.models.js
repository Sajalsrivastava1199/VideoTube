import mongoose,{model, mongo, Schema} from "mongoose";

const playListSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    videos:[{
            type:Schema.Types.ObjectId,
            ref:"video"
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    }

},{
    timestamps:true
})

export const playList = mongoose.model("playList",playListSchema)