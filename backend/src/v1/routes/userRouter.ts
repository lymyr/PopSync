import { Router } from "express";
import { getUsers, login, register } from "../controllers/userController.ts";
import { UserValidation } from "../../middleware/validation/UserValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import passport from "../../lib/passport.ts";
import SearchQueryValidation from "../../middleware/validation/SearchQueryValidation.ts";
import type { SearchQuery } from "../../middleware/validation/SearchQueryValidation.ts";

const userRouter = Router()

userRouter.get("/search", 
    SearchQueryValidation.searchUser,
    throwerHelper<{}, {}, {}, SearchQuery>,
    getUsers
)

userRouter.post("/", 
    UserValidation.register,
    throwerHelper,
    register
)

userRouter.post("/authenticate",
    passport.authenticate("local"),
    login
)

export default userRouter