import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { user } from "../models/user.models.js";


const verifyJWT = asyncHandler(async(req,_,next,error) =>{
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!accessToken){
            throw new apiError(401,"Unauthorized request")
        }
        const decodedAccessToken = await jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
        console.log(decodedAccessToken,decodedAccessToken?._id)
        const User = await user.findById(decodedAccessToken?._id).
        select("-password -refreshToken")
    
        if(!User){
            throw new apiError(401,"Invalid Access Token")
        }
        req.user = User
        next()
    } catch (error) {
        throw new apiError(401,error?.message||"Invalid Access TOKEN")
    }
    

})

export {verifyJWT}