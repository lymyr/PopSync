import { Router } from "express";
import ReviewValidation from "../../../middleware/validation/ReviewValidation.ts";
import { throwerHelper } from "../../../middleware/validation/Validation.ts";
import { addComment, deleteComment, getComments } from "../../controllers/commentController.ts";
import commentValidation from "../../../middleware/validation/CommentValidation.ts";

const commentRouter = Router({mergeParams: true})

commentRouter.get("/",
    ReviewValidation.id(),
    throwerHelper,
    getComments
)

commentRouter.post("/{:commentId}",
    [
        ReviewValidation.id(),
        commentValidation.commentId,
        commentValidation.content,
    ],
    throwerHelper,
    addComment
)

commentRouter.delete("/{:commentId}",
    [
        ReviewValidation.id(),
        commentValidation.commentId
    ],
    throwerHelper,
    deleteComment
)

export default commentRouter