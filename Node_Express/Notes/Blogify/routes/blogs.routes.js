import { blogController } from "#controllers"
import { authorizeToRemove, requiredLogin } from "#middlewares"
import { upload } from "#utils"
import express from "express"

const router = express.Router()

router.get("/add-new", requiredLogin, blogController.addBlogPage)
router.post("/", requiredLogin, upload.single("coverImage"), blogController.addBlog)
router.get("/:id",blogController.viewBlog)
router.post("/comment/:id",blogController.createComment)
router.get("/delete/:id",requiredLogin,authorizeToRemove,blogController.deleteBlog)

export default router