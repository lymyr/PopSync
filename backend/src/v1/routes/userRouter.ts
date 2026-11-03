import { Router } from "express";
import { getUsers, login, register } from "../controllers/userController.ts";
import { UserValidation } from "../../middleware/validation/UserValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import passport from "../../lib/passport.ts";
import SearchQueryValidation from "../../middleware/validation/SearchQueryValidation.ts";
import type { SearchQuery } from "../../middleware/validation/SearchQueryValidation.ts";
import isAuth from "../../middleware/auth/isAuth.ts";

const userRouter = Router()

userRouter.post("/", 
    UserValidation.register,
    throwerHelper,
    register
)

userRouter.post("/authenticate",
    passport.authenticate("local"),
    login
)

userRouter.use(isAuth)

userRouter.get("/search", 
    SearchQueryValidation.searchUser,
    throwerHelper<{}, {}, {}, SearchQuery>,
    getUsers
)

export default userRouter