import express from "express";
import { protect } from "../middlewares/auth.js";
import { getAllUserProjects, getProjectById, getUserCredits, togglePublish } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/credits", protect, getUserCredits);
userRouter.get("/projects", protect, getAllUserProjects);
userRouter.get("/projects/:id", protect, getProjectById);
userRouter.get("/publish/:id", protect, togglePublish);

export default userRouter;