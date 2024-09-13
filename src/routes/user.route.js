import { Router } from "express";
import { changeCurrentPassword, coverImageUpdate, getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { verify } from "jsonwebtoken";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",// This needs to be same in frontend and should match the form input name for multer matching
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1 
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)


// Secured Routes
router.route("/logout").post(
    verifyJWT
    ,logoutUser
)
router.route("/refresh-token").post(
    refreshAccessToken
)
router.route("/change-password").post(
    verifyJWT,
    changeCurrentPassword
)
router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)
router.route("/update-accounts").patch(
    verifyJWT,
    updateAccountDetails
)
router.route("/avatar").patch(
    verifyJWT,
    upload.single("avatar"),
    avatarUpdate
)
router.route("/cover-image").patch(
    verifyJWT,
    upload.single("coverImage"),
    coverImageUpdate
)
router.route("/c/:username").get(
    verifyJWT,
    getUserChannelProfile
) 
router.route("/history").get(
    verifyJWT,
    getWatchHistory
) 

export default router 