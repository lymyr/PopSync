import { Router } from "express";
import { addComment, deleteComment, likeReview, postReview, unlikeReview, updateReview } from "../controllers/reviewController.ts";
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

reviewRouter.put("/:id",
    ReviewValidation.update,
    throwerHelper,
    watchlistRatingSideEffectService,
    updateReview
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