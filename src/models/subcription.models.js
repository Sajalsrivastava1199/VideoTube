import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,// one who is subscriping
        ref:"user"
    },
    channel:{
        type:Schema.Types.ObjectId,// The owner of channel
        ref:"user"
    },


},{
    timestamps:true
})

export const subscription = mongoose.model("subscription",subscriptionSchema) 