import { Router } from "express";
import { deleteReview, getReview, getTimeline, postReview, updateReview } from "../controllers/reviewController.ts";
import isAuth from "../../middleware/auth/isAuth.ts";
import ReviewValidation from "../../middleware/validation/ReviewValidation.ts";
import watchlistRatingSideEffectService from "../../middleware/services/watchlistRatingSideEffectService.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import handleUniqueReview from "../../middleware/errorHandlers/handleUniqueReview.ts";
import commentRouter from "./review-subroutes/commentRouter.ts";
import likeRouter from "./review-subroutes/likeRouter.ts";

const reviewRouter = Router()
reviewRouter.use(isAuth)

reviewRouter.get("/",
    getTimeline
)

reviewRouter.post("/", 
    ReviewValidation.post,
    throwerHelper,
    watchlistRatingSideEffectService,
    postReview,
    handleUniqueReview,
)

reviewRouter.get("/:id",
    ReviewValidation.canView(),
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

reviewRouter.use("/:id/comments", commentRouter)
reviewRouter.use("/:id/likes", likeRouter)

export default reviewRouter