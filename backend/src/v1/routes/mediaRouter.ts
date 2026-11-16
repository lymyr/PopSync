import { Router } from "express";
import isAuth from "../../middleware/auth/isAuth.ts";
import MediaValidation from "../../middleware/validation/MediaValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import { getMovieDetails, getSeriesDetails, searchResults } from "../controllers/mediaController.ts";

const mediaRouter = Router()

mediaRouter.use(isAuth)

mediaRouter.get("/",
    MediaValidation.search,
    throwerHelper,
    searchResults
)

mediaRouter.get("/movies",
    MediaValidation.id,
    throwerHelper,
    getMovieDetails
)

mediaRouter.get("/series",
    MediaValidation.id,
    throwerHelper,
    getSeriesDetails
)


export default mediaRouter