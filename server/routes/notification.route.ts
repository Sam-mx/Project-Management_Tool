import express from "express";
import { getNotifications, markRead } from "../controllers/notifcation.controller";
import { authMiddleware } from "../middlewares/auth"; // Adjust path if your auth middleware is named differently

const notificationRouter = express.Router();

// GET all notifications for the current user
notificationRouter.get("/", authMiddleware, getNotifications);

// PUT mark all notifications as read
notificationRouter.put("/read", authMiddleware, markRead);

export default notificationRouter;