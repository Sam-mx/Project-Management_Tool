import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as aiController from "../controllers/ai.controller";

const aiRouter = express.Router();

// Protected(Auth) POST /ai/process-task -> Use AI to prioritize and categorize a task
aiRouter.post("/process-task", authMiddleware, aiController.processTaskWithAI);

export default aiRouter;