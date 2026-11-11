import { Router } from "express";
import WatchListValidation from "../../../middleware/validation/WatchListValidation.ts";
import {throwerHelper} from "../../../middleware/validation/Validation.ts";
import { addToMovieWatchList, addToSeriesWatchList, deleteMovieWatchList, deleteSeriesWatchList, getWatchList, updateMovieWatchList, updateSeriesWatchList } from "../../controllers/watchlistController.ts";

const watchlistRouter = Router({mergeParams: true})

watchlistRouter.get("/", 
    WatchListValidation.canAccess,
    throwerHelper,
    getWatchList
)

watchlistRouter.post("/movies",
    WatchListValidation.moviePayload,
    throwerHelper,
    addToMovieWatchList
)

watchlistRouter.put("/movies",
    WatchListValidation.updatePayload,
    throwerHelper,
    updateMovieWatchList
)

watchlistRouter.delete("/movies",
    [
        WatchListValidation.isOwner,
        WatchListValidation.id()
    ],
    throwerHelper,
    deleteMovieWatchList
)

watchlistRouter.post("/series",
    WatchListValidation.seriesPayload,
    throwerHelper,
    addToSeriesWatchList
)

watchlistRouter.put("/series",
    WatchListValidation.updatePayload,
    throwerHelper,
    updateSeriesWatchList
)

watchlistRouter.delete("/series",
    [
        WatchListValidation.isOwner,
        WatchListValidation.id()
    ],
    throwerHelper,
    deleteSeriesWatchList
)

export default watchlistRouter