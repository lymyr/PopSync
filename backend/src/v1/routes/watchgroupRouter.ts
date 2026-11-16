import { Router } from "express";
import isAuth from "../../middleware/auth/isAuth.ts";
import WatchgroupValidation from "../../middleware/validation/WatchgroupValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import { addUserToWatchgroup, createWatchgroup, deleteUserFromWatchgroup } from "../controllers/watchgroupController.ts";

const watchgroupRouter = Router()
watchgroupRouter.use(isAuth)

watchgroupRouter.post("/",
    WatchgroupValidation.members,
    WatchgroupValidation.name,
    throwerHelper,
    createWatchgroup
)

watchgroupRouter.post("/:id/users",
    WatchgroupValidation.members,
    WatchgroupValidation.isAdmin,
    throwerHelper,
    addUserToWatchgroup
)

watchgroupRouter.delete("/:id/users/:userId",
    WatchgroupValidation.isAdmin,
    WatchgroupValidation.userId,
    throwerHelper,
    deleteUserFromWatchgroup
)

export default watchgroupRouter