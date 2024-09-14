import mongoose,{model, mongo, Schema} from "mongoose";

const likeSchema = new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"comment",
        required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"video",
        required:true
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"tweet",
        required:true
    }

},{
    timestamps:true
})

export const like = mongoose.model("like",likeSchema)