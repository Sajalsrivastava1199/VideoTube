import mongoose,{ model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videofile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,// Cloudinary file lekr information share krta h duration wgera
        required:true
    },
    views:{
        type:Number,
        required:true,
        default:0        
    },
    isPublished:{
        type:Boolean,
        required:true,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },

},
{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate)// allows to write aggregate queries

export const video = model("video",videoSchema)