import { Router } from 'express';
import { verifyJWT } from "../middleware/auth.middleware.js"
import { publishAVideo,getVideoById, updateVideo, deleteVideo, togglePublishStatus } from '../controllers/video.controller.js';
import { upload } from "../middleware/multer.middleware.js";


const router = Router();
router.use(verifyJWT); // Using verifyJWT middleware to all routes in this file

router.
    route('/')
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnailFile",
                maxCount: 1,
            }
        ]),
        publishAVideo
    )
router
.route("/:videoId")
.get(getVideoById)
.patch(
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]),
    updateVideo
)
.delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router
