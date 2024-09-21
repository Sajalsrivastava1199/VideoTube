import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import { comment } from "../models/comment.models.js"
import { video } from "../models/video.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/fileupload.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import {subscription} from "../models/subscription.model.js"
import { user } from "../models/user.models.js";


const getChannelStats = asyncHandler(async (req, res) => {
    //Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const currentUserID = req.user._id
    const Video = await video.aggregate([
        {
            $match:{owner:new mongoose.Types.ObjectId(currentUserID)},// Gets All Videos
        },{
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",// Gets All Likes
            }
        },{
            $project:{
                totallikes:{$size:'$likes'},
                totalviews:"$views",
                totalVideos:1
            }
        },{
            $group:{
                _id:null,
                totallikes:{$sum:"$totallikes"},
                totalviews:{$sum:"$totalviews"},
                totalVideos:{$sum:"$totalVideos"}
            }
        }

    ])
    const Subscriber = await subscription.aggregate([
        {$match:{channel:new mongoose.Types.ObjectId(currentUserID)}},
        {$group:{
            _id:null,
            subscribersCount:{$sum:1},

        }}
    ])
    
    const channelStats = {
        totalSubscribers: Subscriber[0]?.subscribersCount || 0,
        totalLikes: Video[0]?.totalLikes || 0,
        totalViews: Video[0]?.totalViews || 0,
        totalVideos: Video[0]?.totalVideos || 0,
    };

    return res
    .status(200)
    .json(
        new apiResponse(200,channelStats,"Channel Information fetched sucessfuly")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    //Get all the videos uploaded by the channel
    const currentUserID = req.user._id
    const allVideoList = await video.aggregate([
        {$match:{owner:new mongoose.Schema.Types.ObjectId(currentUserID)}},
        {$lookup:{
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likes",// Gets All Likes
        }},
        {$addFields:{
            createdAt:{date:"$createdAt"},
            likesCount:{$size:"$likes"}
        }},
        {$project:{
            _id:1,
            "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        createdAt: {
            year: 1,
            month: 1,
            day: 1,
        },
        isPublished: 1,
        likesCount: 1,
        }}  
    ])
    return res
    .status(200)
    .json(
        new apiResponse(200,allVideoList,"All Video for Channel acquires")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }