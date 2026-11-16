import { Router } from "express";
import isAuth from "../../middleware/auth/isAuth.ts";
import watchgroupValidation from "../../middleware/validation/watchgroupValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import { addUserToWatchgroup, createWatchgroup, deleteUserFromWatchgroup } from "../controllers/watchgroupController.ts";
import getWatchgroupFallbackNameService from "../../middleware/services/getWatchgroupFallbackNameService.ts";

const watchgroupRouter = Router()
watchgroupRouter.use(isAuth)

watchgroupRouter.post("/",
    watchgroupValidation.members,
    watchgroupValidation.name,
    throwerHelper,
    getWatchgroupFallbackNameService,
    createWatchgroup
)

watchgroupRouter.post("/:id/users",
    watchgroupValidation.members,
    watchgroupValidation.isAdmin,
    throwerHelper,
    getWatchgroupFallbackNameService,
    addUserToWatchgroup
)

watchgroupRouter.delete("/:id/users/:userId",
    watchgroupValidation.isAdmin,
    watchgroupValidation.userId,
    throwerHelper,
    getWatchgroupFallbackNameService,
    deleteUserFromWatchgroup
)

export default watchgroupRouter