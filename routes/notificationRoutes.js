import express from "express";
import { deleteNotification, getNotification, markNotificationAsRead } from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/notifications", authMiddleware, getNotification);
notificationRouter.put("/notifications/mark-as-read", authMiddleware, markNotificationAsRead);
notificationRouter.delete("/notifications/:id", authMiddleware, deleteNotification);


export default notificationRouter;