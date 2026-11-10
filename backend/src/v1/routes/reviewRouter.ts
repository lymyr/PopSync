import { Router } from "express";
import { addComment, deleteComment, deleteReview, getComments, getReview, likeReview, postReview, unlikeReview, updateReview } from "../controllers/reviewController.ts";
import isAuth from "../../middleware/auth/isAuth.ts";
import ReviewValidation from "../../middleware/validation/ReviewValidation.ts";
import watchlistRatingSideEffectService from "../../middleware/services/watchlistRatingSideEffectService.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import handleUniqueReview from "../../middleware/errorHandlers/handleUniqueReview.ts";

const reviewRouter = Router()
reviewRouter.use(isAuth)

reviewRouter.post("/", 
    ReviewValidation.post,
    throwerHelper,
    watchlistRatingSideEffectService,
    postReview,
    handleUniqueReview,
)

reviewRouter.get("/:id",
    ReviewValidation.id(),
    throwerHelper,
    getReview
)

reviewRouter.put("/:id",
    ReviewValidation.update,
    throwerHelper,
    watchlistRatingSideEffectService,
    updateReview
)

reviewRouter.delete("/:id",
    ReviewValidation.isAuthor,
    throwerHelper,
    deleteReview
)

reviewRouter.post("/:id/likes",
    ReviewValidation.likeValidation,
    throwerHelper,
    likeReview
)

reviewRouter.delete("/:id/likes",
    ReviewValidation.unlikeValidation,
    throwerHelper,
    unlikeReview
)

reviewRouter.get("/:id/comments",
    ReviewValidation.id(),
    throwerHelper,
    getComments
)

reviewRouter.post("/:id/comments{/:commentId}",
    ReviewValidation.commentValidation,
    throwerHelper,
    addComment
)

reviewRouter.delete("/:id/comments{/:commentId}",
    ReviewValidation.commentValidation.slice(1),
    throwerHelper,
    deleteComment
)

export default reviewRouter