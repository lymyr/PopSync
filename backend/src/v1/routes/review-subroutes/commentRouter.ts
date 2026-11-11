import { Router } from "express";
import ReviewValidation from "../../../middleware/validation/ReviewValidation.ts";
import { throwerHelper } from "../../../middleware/validation/Validation.ts";
import { addComment, deleteComment, getComments, updateComment } from "../../controllers/commentController.ts";
import commentValidation from "../../../middleware/validation/CommentValidation.ts";

const commentRouter = Router({mergeParams: true})

commentRouter.use(
    ReviewValidation.canView(),
    throwerHelper
)

commentRouter.get("/",
    getComments
)

commentRouter.post("/",
    commentValidation.content,
    throwerHelper,
    addComment
)

commentRouter.post("/:commentId",
    [
        commentValidation.commentId,
        commentValidation.content,
    ],
    throwerHelper,
    addComment
)

commentRouter.delete("/:commentId",
    commentValidation.commentId,
    throwerHelper,
    deleteComment
)

commentRouter.put("/:commentId", 
    commentValidation.commentId,
    throwerHelper,
    updateComment
)

export default commentRouter