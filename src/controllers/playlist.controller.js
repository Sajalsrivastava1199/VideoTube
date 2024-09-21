import mongoose, {isValidObjectId} from "mongoose"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {playList } from "../models/playlist.models.js"
import { video } from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //create playlist
    const PlayList = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })
    if(!Playlist){
        throw new apiError(400,"PlayList Creation failed")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,PlayList,"Playlist Creation Success")
    )
    

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    // get user playlists
    if (!isValidObjectId(userId)){
        throw new apiError(400,"User ID incorrect")
    }
    const userPlaylist = await playList.aggregate([
        {$match:{owner:new mongoose.Schema.Types.ObjectId(userId)}},
        {$lookup:{from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos"}},
        {$addFields:{
            "totalVideos":{$size:"$videos"},
            "totalViews":{$sum:"$videos.views"}
        }}

    ])
    
    return res.status(200)
    .json(
        new apiResponse(200,userPlaylist,"PlayList fetched Success")
    )


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //get playlist by id
    if (!isValidObjectId(playlistId)){
        throw new apiError(400,"playlistId Does Not Exist")
    }
    const PlayList = await playList.aggregate([
        {$match:{_id:playlistId}},
        {$lookup:{from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos"}
        }

    ])
    if(!PlayList){
        return new apiError(400,"Playlist Does not exists")
    }
    return res
    .status(200)
    .json(
        new apiResponse(200,PlayList,"Playlist Fetched")
    )
})  

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // Add video to playlist
    if (!isValidObjectId(playlistId) || isValidObjectId(videoId)){
        throw new apiError(400,"Invalid playlistId or videoId ")
    } 

    const playlist = await playList.findById(playlistId)
    const Video = await video.findById(videoId)

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    if (!Video) {
        throw new apiError(404, "video not found");
    }
    if((playlist.owner?.toString() !== req.user?._id.toString()) || 
    (Video.owner.toString() !== req.user?._id.toString())){
        throw new apiError(400, "only owner can add video to thier playlist");
      }

    const updatedPlaylist = await playList.findByIdAndUpdate(playlistId,{
        $addToSet:{videos:videoId}
    },{new:true})
    if (!updatedPlaylist) {
        throw new apiError(400, "failed to add video to playlist please try again");
      }
    
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            updatedPlaylist,
            "Added video to playlist successfully"
          )
        );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // remove video from playlist

    if (!isValidObjectId(playlistId) || isValidObjectId(videoId)){
        throw new apiError(400,"Invalid playlistId or videoId ")
    } 

    const playlist = await playList.findById(playlistId)
    const Video = await video.findById(videoId)

    if (!playlist) {
        throw new apiError(404, "Playlist not found");
    }
    if (!Video) {
        throw new apiError(404, "video not found");
    }
    if((playlist.owner?.toString() !== req.user?._id.toString()) || 
    (Video.owner.toString() !== req.user?._id.toString())){
        throw new apiError(400, "only owner can add video to thier playlist");
      }

    const updatedPlaylist = await playList.findByIdAndUpdate(playlistId,{
        $pull:{videos:videoId}
    },{new:true})
    if (!updatedPlaylist) {
        throw new apiError(400, "failed to add video to playlist please try again");
      }
    
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            updatedPlaylist,
            "Added video to playlist successfully"
          )
        );
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // delete playlist
    if (!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid playlistId")
    } 
    const playList1 = await playList.findById(playlistId)
    if(playList1.owner.toString() !== req.user._id.toString()){
        throw new apiError(400, "only owner can add Delete to their playlist");
    }
    await playList.findByIdAndDelete(playlistId)
    return res
    .status(200)
    .json(
        apiResponse(200,{messaage:"Success"},"Playlist Deletion Success")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    // update playlist
    if (!name || !description) {
        throw new apiError(400, "name and description both are required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new apiResponse(400, "Invalid PlaylistId");
    }

    const playlists = await playList.findById(playlistId);

    if (!playlists) {
        throw new apiError(404, "Playlist not found");
    }

    if (playlists.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "only owner can edit the playlist");
    }

    const updatedPlaylist = await playList.findByIdAndUpdate(
        playlists?._id,
        {
        $set: {
            name,
            description,
        },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
        new apiResponse(200, updatedPlaylist, "playlist updated successfully")
        );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}