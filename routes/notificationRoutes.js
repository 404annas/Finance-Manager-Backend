import express from "express";
import { deleteNotification, getNotification, markNotificationAsRead } from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter } from "../middlewares/apiRateLimit.js";

const notificationRouter = express.Router();

notificationRouter.get("/notifications", authMiddleware, apiLimiter, getNotification);
notificationRouter.put("/notifications/mark-as-read", authMiddleware, apiLimiter, markNotificationAsRead);
notificationRouter.delete("/notifications/:id", authMiddleware, apiLimiter, deleteNotification);


export default notificationRouter;