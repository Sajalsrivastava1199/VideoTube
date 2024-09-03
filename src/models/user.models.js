import mongoose,{model, mongo, Schema} from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,//Cloudinary url hosted
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"video"
        }
    ],
    password:{
        type:String,//encypt storage
        requried:[true,"Password is Required"]
    },
    refreshToken:{
        type:String
    }   

},{
    timestamps:true
})

userSchema.pre("save",async function(req,res,error,next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
    }
    return next
    
})//()=>{} this is not used as context is not carried


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)

}

userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign({
        _id_:this._id_
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        "expiresIn":process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign({
        _id_:this._id_,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {"expiresIn":process.env.ACCESS_TOKEN_EXPIRY}
)
}//as cookies



export const user =  model("user",userSchema)
