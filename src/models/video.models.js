import mongoose,{ model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videofile:{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    thumbnail:{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
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
    },

},
{
    timestamps:true
})

videoSchema.plugin(mongooseAggregatePaginate)// allows to write aggregate queries

export const video = model("video",videoSchema)