import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js"
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

export default router 