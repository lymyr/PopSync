import { Router } from "express";
import { getUsers, login, register } from "../controllers/userController.ts";
import { UserValidation } from "../../middleware/validation/UserValidation.ts";
import { throwerHelper } from "../../middleware/validation/Validation.ts";
import passport from "../../lib/passport.ts";

const userRouter = Router()

// todo: update with query
userRouter.get("/search", getUsers)

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