import { Router } from "express";
import isAuth from "../../middleware/auth/isAuth.ts";
import MediaValidation from "../../middleware/validation/MediaValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import mediaSearchService from "../../middleware/services/mediaSearchService.ts";
import { getMovieDetails, getSeriesDetails, searchResults } from "../controllers/mediaController.ts";
import mediaDetailsService from "../../middleware/services/mediaDetailsService.ts";

const mediaRouter = Router()

mediaRouter.use(isAuth)

mediaRouter.get("/",
    MediaValidation.search,
    throwerHelper,
    mediaSearchService,
    searchResults
)

mediaRouter.get("/movies",
    MediaValidation.id,
    throwerHelper,
    mediaDetailsService,
    getMovieDetails
)

mediaRouter.get("/series",
    MediaValidation.id,
    throwerHelper,
    mediaDetailsService,
    getSeriesDetails
)


export default mediaRouter