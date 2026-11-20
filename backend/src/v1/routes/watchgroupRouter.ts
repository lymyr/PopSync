import { Router } from "express";
import isAuth from "../../middleware/auth/isAuth.ts";
import WatchgroupValidation from "../../middleware/validation/WatchgroupValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import leaveWatchgroup, { addMovieToWatchgroup, addSeriesToWatchgroup, addUserToWatchgroup, compareMedia, createWatchgroup, deleteUserFromWatchgroup, removeMovieFromWatchgroup, removeSeriesFromWatchgroup } from "../controllers/watchgroupController.ts";
import WatchListValidation from "../../middleware/validation/WatchListValidation.ts";

const watchgroupRouter = Router()
watchgroupRouter.use(isAuth)

/* 
    note/todo: 
    maybe throw away fallback name based on current members since 
    it's too tedious to manage. It needs to keep track of the current members
    which also adds db operations/calls.
*/
watchgroupRouter.post("/",
    WatchgroupValidation.members,
    WatchgroupValidation.name,
    throwerHelper,
    createWatchgroup
)

watchgroupRouter.get("/:id",
    WatchgroupValidation.isMember(),
    WatchListValidation.comparisonPagination,
    throwerHelper,
    compareMedia
)

watchgroupRouter.post("/:id/users",
    WatchgroupValidation.members,
    WatchgroupValidation.isAdmin,
    throwerHelper,
    addUserToWatchgroup
)

watchgroupRouter.delete("/:id/users", 
    WatchgroupValidation.id(),
    throwerHelper,
    leaveWatchgroup
)

watchgroupRouter.delete("/:id/users/:userId",
    WatchgroupValidation.isAdmin,
    WatchgroupValidation.targetUserId,
    throwerHelper,
    deleteUserFromWatchgroup
)

watchgroupRouter.post("/:id/movies",
    WatchgroupValidation.isAdmin,
    throwerHelper,
    addMovieToWatchgroup
)

watchgroupRouter.post("/:id/series",
    WatchgroupValidation.isAdmin,
    throwerHelper,
    addSeriesToWatchgroup
)

watchgroupRouter.delete("/:id/movies/:movieId",
    WatchgroupValidation.isAdmin,
    throwerHelper,
    removeMovieFromWatchgroup
)

watchgroupRouter.delete("/:id/series/:seriesId",
    WatchgroupValidation.isAdmin,
    throwerHelper,
    removeSeriesFromWatchgroup
)

export default watchgroupRouter