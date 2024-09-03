import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import validator from "validator";
import { user } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/fileupload.js";
import { apiResponse } from "../utils/apiResponse.js";



const registerUser = asyncHandler( async (req,res) => {
    // username email passwword
    // validation -- not empty 
    //  check if not present
    // files present images avatar
    // upload to cloudinary and get url of image
    // create object user --> create a new entry in db call
    // remove password and refresh token from response back
    // check for response creation done ; return response or error

    const {username,email,fullname,password} = req.body
    // console.log(username,email,fullname,password)
    if ([username,email,fullname,password].some((field)=>{
        field?.trim()==""
    })){
        throw new apiError(400,"All field are required")
    }

    if (!validator.isEmail(email)){
        throw new apiError(400,"Incorrect Email Address")
    }
    const existingUser = await user.findOne({
        $or:[{ username },{ email }]
    })

    if (existingUser){
        throw new apiError(409,"Username or Email already exists")
    }
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is required")
    }

    const newuser = await user.create({
        fullname,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username:username.toLowerCase(),
        password,
    })

    const checkUserCreated = await user.findById(newuser._id).select(
        "-password -refreshToken"
    )

    if (!checkUserCreated){
        throw new apiError(500,"Something went wrong while User Creation")
    }

    return res.status(201).json(
        new apiResponse(200,checkUserCreated,"User Regestiration Succesful") 
    )
})

export {registerUser} 

