import mongoose, {isValidObjectId} from "mongoose"
import {like} from "../models/like.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //toggle like on video
    if(!isValidObjectId(videoId)){
        throw new apiError(400, "Invalid videoId")
    }
    const likedalready = await like.findOne(
        {video:videoId,likedBy:new mongoose.Schema.Types.ObjectId(req.user._id)}
    )
    if(likedalready){
        await like.findByIdAndDelete(likedalready._id)
        res.status(200)
        .json(new apiResponse(200,"Video UnLiked"))
    }
    await like.create(
        {video:videoId,
        likedBy:req.user._id}
    )
    return res.status(200)
    .json(200,"Liked Video Successfully")
 
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    // toggle like on a particular comment by the user
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid commentId");
    }

    const likedAlready = await like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await like.findByIdAndDelete(likedAlready?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, "unliked comment successfully"));
    }

    await like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new apiResponse(200, "liked comment successfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //toggle like on a particular tweet by the user
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid TweetID");
    }

    const likedAlready = await like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await like.findByIdAndDelete(likedAlready?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, "unliked Tweet successfully"));
    }

    await like.create({
        tweet: commentId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new apiResponse(200, "liked tweet successfully"));

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    // Aggregating liked videos based on the user's ID
    const likedVideosAgg = await like.aggregate([
        {$match:{likedBy:new mongoose.Schema.Types.ObjectId(req.user._id)}},
        {$lookup:{from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "likedVideo",
        // Nested pipeline for additional video details and owner information
            pipeline:[{
                $lookup:{
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                }
            },{$unwind:"$ownerDetails"}]
        
        }},
        {$unwind:"$likedVideo"},
        {$project:{
            _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    // Including owner details with specific fields
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
        }}        
    ])
    return res
    .status(200)
    .json(
    new apiResponse(
        200,
        likedVideosAgg,
        "Liked videos fetched successfully"
    )
);


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}