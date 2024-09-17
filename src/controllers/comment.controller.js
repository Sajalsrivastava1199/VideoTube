import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import { comment } from "../models/comment.models.js"
import { video } from "../models/video.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/fileupload.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";


const getVideoComments = asyncHandler(async (req, res) => {
    //get all comments for a video
    try {
        const {videoId} = req.params
        const {page = 1, limit = 10} = req.query

        // Check if video exists
        const videoExists = await comment.findById(videoId)    
        if(!videoExists){
            throw new apiError(404,"Video File Not found")
        }    

        
        const comments = await comment.aggregate(
            [
                {
                    $match:{
                        video:new mongoose.Types.ObjectId(videoId)
                    }
                },
                {
                    $skip: (page - 1) * limit  // Skip comments based on current page
                },
                {
                    $project:{
                        content:1
                    }
                },
                {
                    $limit: parseInt(limit)  // Limit the number of comments returned
                }
            ]
        )
    } catch (error) {
        return new apiError(401,"getVideoComments Failed")
        
    }
    return res
    .status(200)
    .json(
        apiResponse(200,comments,"Video Comments succesfully Recieved")
    )

})

const addComment = asyncHandler(async (req, res) => {
    //add a comment to a video
    const User = req.user // Verify Jwt takes care of it 
    const {videoId} = req.params
    const {content} = req.body
    console.log(User,videoId,typeof(content))
    if(!content){
        throw new apiError(400,"Content is Required")
    }

    const Video = await video.findById(videoId)
    console.log(Video)
    if (!Video) {
        throw new ApiError(404, "Video not found");
    }

    
    const newComment = await comment.create(
        {
            content:content,
            video:new mongoose.Types.ObjectId(videoId),
            owner:new mongoose.Types.ObjectId(User._id)
        }
    )
    const newCommentMessage = await comment.findById(newComment._id)

    return res
    .status(200)
    .json(
        apiResponse(200,
            newCommentMessage,
            "Comment Added Succesfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // update a comment
    // Only Owner can update a comment
    const {commentid} = req.params
    const {content} = req.body

    if(!isValidObjectId(commentid)){
        throw new apiError(401,"Invalid Comment ID")
    }
    if(!content){
        throw new apiError(401,"Content is Required")
    }
    const orignalComment = await comment.findById(commentid)
    if(!orignalComment){
        throw new apiError(401,"Comment Does not Exists")
    }
    if(req.user._id.toString() != orignalComment.owner.toString()){
        throw new apiError(401,"UnAuthorized to make the change")
    }
    const updatedComment = await comment.findByIdAndUpdate(commentid,
        {
            $set:{
                content
            }
        },
        {new:true}
    )
})

// delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "only comment owner can delete their comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}