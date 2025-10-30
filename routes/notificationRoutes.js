import express from "express";
import { getNotification, markNotificationAsRead } from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/notifications", authMiddleware, getNotification);
notificationRouter.post("/notifications/mark-as-read", authMiddleware, markNotificationAsRead);

export default notificationRouter;