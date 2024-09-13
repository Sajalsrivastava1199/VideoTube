import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import validator from "validator";
import { user } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/fileupload.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const User = await user.findById(userId)
        const refreshToken = User.generateRefreshToken()
        const accessToken = User.generateAccessToken()
        user.refreshToken = refreshToken
        user.accessToken = accessToken
        await User.save({validateBeforeSave:false})
        return {refreshToken,accessToken}
        
    } catch (error) {
        throw new apiError(500,"Error while AT and RT Generation")
        
    }
}


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

const loginUser = asyncHandler(async (req,res) => {
    // req body -- > username,password
    // check if username exist --> validate password
    // AT RT give to user
    // send in cookies

    const {email,username,password} = req.body
    if(!email && !username){
        throw new apiError(400,"Username or Email is required")
    }
    
    const User = await user.findOne({
        $or:[{username},{email}]
    })
    
    if(!User){
        throw new apiError(404,"User Does Not Exists")
    }
    
    const isPasswordValid = await User.isPasswordCorrect(password)
    // this method is avaialble from the object returned to us by mongoose model
    if(!isPasswordValid){
        throw new apiError(401,"Invalid Credentials")
    }

    // AT RT
    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(User._id)
    const loggedinuser = await user.findById(User._id).
    select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:loggedinuser,accessToken,refreshToken
            },
            "User Logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) =>{
        const Userid = req?._id
        await user.findByIdAndUpdate(
            Userid,
            {
                $set:{"refreshToken":undefined}
            },
            {  
                new:true
            }
        )
        const options = {
            httpOnly:true,
            secure:true
        }
        return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
        .json(new apiResponse(200,{},"User logged Out"))

    }
)

const refreshAccessToken = asyncHandler(async(req,res)=>{
    // cookie se AT --> 
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
            throw new apiError(401,"UnAuthorized Request")
        }
        const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const User = await user.findById(decodedRefreshToken?._id)
        if(!User){
            throw new apiError(401,"Invalid RefreshToken")
        }
        if(User.refreshToken !== incomingRefreshToken){
            throw new apiError(401,"Refresh Token Expired Or used")
        }
        const options = {
            httpOnly:true,
            secure:true
        }
        const {newrefreshToken,accessToken} = await generateAccessAndRefreshToken(User._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new apiResponse(200,
                {accessToken,refreshToken:newrefreshToken},
                "Access Token Refreshed"
            )
        )
        
    } catch (error) {
        throw new apiError(400,"Token Refresh Failed")
        
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword,confirmPassword} = req.body
    const User = await user.findById(req.user?._id)
    const isPasswordCorrect = await User.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new apiError(401,"Old Password Incorrect")
    }
    User.password = newPassword
    await User.save({validateBeforeSave:false})
    
    return res
    .status(200)
    .json(
        new apiResponse(200,{},"Password Changed")
    )

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user)
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,username,email} = req.body
    if(!(fullname&&email)){
        throw new apiError(400,"Email and Fullname are required")
    }
    const updateInformation = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,email
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new apiResponse(200,updateInformation,"Account Details Updated Successfully"))
})

const avatarUpdate = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new apiError(400,"Upload Avatar file")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(avatar.url){
        throw new apiError(401,"Error while Uploading Avatar file")
    }
    

    const User = await user.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    const oldAvatarUrl = req.user.avatar
    await deleteFromCloudinary(oldAvatarUrl)
    
    return res.status(200)
    .json(
        new apiResponse(200,User,"Avatar Updated")
    )
})

const coverImageUpdate = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new apiError(400,"Upload coverImage file")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(coverImage.url){
        throw new apiError(401,"Error while Uploading coverImage file")
    }
    
    const User = await user.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")
    const coverImageUrl = req.user.coverImage
    await deleteFromCloudinary(coverImageUrl)

    return res.status(200)
    .json(
        new apiResponse(200,User,"Cover Image Updated")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req?.params
    if(!username?.trim){
        throw new apiError(400,"Username Not found")
    }
    // const User = user.findById({username})// this is good 
    // But can be clubbed inside aggragation pipeline 

    const channel = await user.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"

            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelssubscribedCount:{
                    $size:"$subscribedTo"
                },
                isSuscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:   {
                fullname:1,
                username:1,
                subscribersCount:1,
                isSuscribed:1,
                avatar:1,
                coverImage:1,
                createdat:1            
            }
        }
    ])
    console.log(channel)
    if(!channel?.length){
        throw new apiError(404,"Channel does not exist")
    }
    return res
    .status(200)
    .json(
        new apiResponse(200,channel[0],"User Channel Info Fetched successfuly")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const User = await user.aggregate(
        [
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"watchHistory",
                    foreignField:"_id",
                    as:"watchHistoryVideos",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner",
                                pipeline:[
                                    {
                                        $project:{
                                            fullname:1,
                                            username:1,
                                            avatar:1
                                        
                                        }
                                    }
                                ]
                            }

                        },
                        {
                            $addFields:{
                                owner:{
                                    $first:"$owner"
                                }
                            }
                        }
                    ],

                }
            }

        ]
    )
    return res.status(200)
    .json(
        new apiResponse(200,
            User[0].watchHistoryVideos,
            "watchHistoryVideos Fetched Successfuly")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    avatarUpdate,
    coverImageUpdate,
    getUserChannelProfile,
    getWatchHistory
} 


