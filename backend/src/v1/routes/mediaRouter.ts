import { Router } from "express";
import isAuth from "../../middleware/auth/isAuth.ts";
import MediaValidation from "../../middleware/validation/MediaValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import mediaSearchService from "../../middleware/services/mediaSearchService.ts";
import { searchResults } from "../controllers/mediaController.ts";

const mediaRouter = Router()

mediaRouter.use(isAuth)

mediaRouter.get("/",
    MediaValidation.search,
    throwerHelper,
    mediaSearchService,
    searchResults
)

export default mediaRouter