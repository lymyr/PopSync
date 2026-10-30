import { Router } from "express";
import { getUsers, register } from "../controllers/userController.ts";
import { throwerHelper, UserValidation } from "../../middleware/validation.ts";

const userRouter = Router()

// todo: update with query
userRouter.get("/search", getUsers)

userRouter.post("/", 
    UserValidation.validateRegisterPayload,
    throwerHelper,
    register
)

export default userRouter