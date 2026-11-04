import { Router } from "express";
import isAuth from "../../middleware/auth/isAuth.ts";
import WatchListValidation from "../../middleware/validation/WatchListValidation.ts";
import {throwerHelper} from "../../middleware/validation/Validation.ts";
import { addToMovieWatchList, deleteMovieWatchList, updateMovieWatchList } from "../controllers/watchlistController.ts";

const watchlistRouter = Router()
watchlistRouter.use(isAuth)

watchlistRouter.post("/movies",
    WatchListValidation.moviePayload,
    throwerHelper,
    addToMovieWatchList
)

watchlistRouter.put("/movies",
    WatchListValidation.id(),
    throwerHelper,
    updateMovieWatchList
)

watchlistRouter.delete("/movies",
    WatchListValidation.id(),
    throwerHelper,
    deleteMovieWatchList
)

export default watchlistRouter