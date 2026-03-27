import express from "express";
import { protect } from "../middlewares/auth.js";
import { createProject, createVideo, deleteProject, getAllPublishedProjects } from "../controllers/projectController.js";


const projectRouter = express.Router();

projectRouter.post("/create", protect, createProject);
projectRouter.post("/video", protect, createVideo);
projectRouter.get("/publihsed", getAllPublishedProjects);
projectRouter.post("/:projectId", protect, deleteProject);

export default projectRouter;