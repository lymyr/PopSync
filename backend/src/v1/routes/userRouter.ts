import { Router } from "express";
import { getUsers } from "../controllers/userController.ts";

const userRouter = Router()

userRouter.get("/", getUsers)

export default userRouter