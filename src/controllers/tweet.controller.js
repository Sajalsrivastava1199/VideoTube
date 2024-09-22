import mongoose, { isValidObjectId } from "mongoose"
import {tweet} from "../models/tweet.models.js"
import {user} from "../models/user.models.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // tweet
    const {content} = req.body
    if(!content){
        throw new apiError(400,"Content Required")
    }

    const newTweet = await tweet.create({
        content,
        channel:req.user._id
    })
    if(!newTweet){
        throw new apiError(400,"Tweet Creatoin Failed")
    }
    return res
        .status(200)
        .json(new apiResponse(200, newTweet, "Tweet created successfully"));

})

const getUserTweets = asyncHandler(async (req, res) => {
    //  get user tweets
    const userId = req.params
    if(!isValidObjectId(userId)){
        throw new apiError(400,"Invalid User id")
    }
    const userTweets = await tweet.aggregate({
        $match:{owner:userId}
    })
    return res
    .status(200)
    .json(new apiResponse(200),userTweets,"Tweets Fetched Successfully")

})

const updateTweet = asyncHandler(async (req, res) => {
    // update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"Invalid tweetId")
    }

    if(!content){
        throw new apiError(400,"Content Required")
    }

    const orginaltweet = await tweet.findById(tweetId)
    if(!orginaltweet){
        throw new apiError(400,"Tweet Does not Exists")
    }

    if(orginaltweet.owner.toString() !== req.user?._id.toString()){
        throw new apiError(400, "only owner can edit thier tweet");
    }
    const updatedTweet = await tweet.findByIdAndUpdate(tweetId,{
        content
    },{new:true})
    if (!updatedTweet) {
        throw new apiError(500, "Failed to edit tweet please try again");
    }

    return res
        .status(200)
        .json(new apiResponse(200, updatedTweet, "Tweet updated successfully"));


})

const deleteTweet = asyncHandler(async (req, res) => {
    // delete tweet
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"Invalid tweetId")
    }
    const orginaltweet = await tweet.findById(tweetId)
    if(!orginaltweet){
        throw new apiError(400,"Tweet Does not Exists")
    }

    if(orginaltweet.owner.toString() !== req.user?._id.toString()){
        throw new apiError(400, "only owner can delete thier tweet");
    }
    await tweet.findByIdAndDelete(tweetId,{
        content
    },{new:true})


    return res
        .status(200)
        .json(new apiResponse(200, {"message":"tweet deleted"}, "Tweet deleted successfully"));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}