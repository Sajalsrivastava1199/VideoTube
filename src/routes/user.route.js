import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

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
export default router 