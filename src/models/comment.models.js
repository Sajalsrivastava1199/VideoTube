import mongoose,{ model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content:{
            type:String,
            required:true
        },
        video:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"video"
        },
        owner:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"user"
        }

    },
    {timestamps:true}
)
commentSchema.plugin(mongooseAggregatePaginate)// allows to write aggregate queries

export const comment = model("video",commentSchema)// Lowercase aur 's added by mongo db