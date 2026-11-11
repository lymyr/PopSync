import { Router } from "express";
import { throwerHelper } from "../../../middleware/validation/Validation.ts";
import { likeReview, unlikeReview } from "../../controllers/likeController.ts";
import LikeValidation from "../../../middleware/validation/LikeValidation.ts";

const likeRouter = Router({mergeParams: true})

likeRouter.post("/",
    LikeValidation.like,
    throwerHelper,
    likeReview
)

likeRouter.delete("/",
    LikeValidation.unlike,
    throwerHelper,
    unlikeReview
)

export default likeRouter