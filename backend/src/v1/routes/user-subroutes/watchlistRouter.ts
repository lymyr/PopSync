import { Router } from "express";
import isAuth from "../../../middleware/auth/isAuth.ts";
import WatchListValidation from "../../../middleware/validation/WatchListValidation.ts";
import {throwerHelper} from "../../../middleware/validation/Validation.ts";
import { addToMovieWatchList, addToSeriesWatchList, deleteMovieWatchList, deleteSeriesWatchList, getWatchList, updateMovieWatchList, updateSeriesWatchList } from "../../controllers/watchlistController.ts";

const watchlistRouter = Router()
watchlistRouter.use(isAuth)

watchlistRouter.get("/", getWatchList)

watchlistRouter.post("/movies",
    WatchListValidation.moviePayload,
    throwerHelper,
    addToMovieWatchList
)

watchlistRouter.put("/movies",
    WatchListValidation.payload,
    throwerHelper,
    updateMovieWatchList
)

watchlistRouter.delete("/movies",
    WatchListValidation.id(),
    throwerHelper,
    deleteMovieWatchList
)

watchlistRouter.post("/series",
    WatchListValidation.seriesPayload,
    throwerHelper,
    addToSeriesWatchList
)

watchlistRouter.put("/series",
    WatchListValidation.payload,
    throwerHelper,
    updateSeriesWatchList
)

watchlistRouter.delete("/series",
    WatchListValidation.id(),
    throwerHelper,
    deleteSeriesWatchList
)

export default watchlistRouter