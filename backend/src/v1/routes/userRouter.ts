import { Router } from "express";
import { createGuest, deleteAccount, getUserDetails, getUsers, login, logout, register } from "../controllers/userController.ts";
import { UserValidation } from "../../middleware/validation/UserValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import SearchQueryValidation from "../../middleware/validation/SearchQueryValidation.ts";
import type { SearchQuery } from "../../middleware/validation/SearchQueryValidation.ts";
import isAuth from "../../middleware/auth/isAuth.ts";
import watchlistRouter from "./user-subroutes/watchlistRouter.ts";
import handleLogin from "../../middleware/auth/handleLogin.ts";

const userRouter = Router()

userRouter.post("/", 
    UserValidation.register,
    throwerHelper,
    register
)

userRouter.post("/authenticate",
    handleLogin,
    login
)

userRouter.post("/guests",
    createGuest
)

userRouter.use(isAuth)

userRouter.get("/", 
    SearchQueryValidation.searchUser,
    throwerHelper<{}, {}, {}, SearchQuery>,
    getUsers
)

userRouter.get("/:userId",
    UserValidation.userId(),
    throwerHelper,
    getUserDetails
)

userRouter.delete("/",
    deleteAccount
)

userRouter.delete("/authenticate",
    logout
)

userRouter.use("/:userId/watchlist", watchlistRouter)

export default userRouter