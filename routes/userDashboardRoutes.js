import express from "express";
import { authMiddleware, isUser } from "../middlewares/authMiddleware.js";
import { getUserDashboard } from "../controllers/userController.js";

const userDashboardRoutes = express.Router();

userDashboardRoutes.get("/", authMiddleware, isUser, getUserDashboard);

export default userDashboardRoutes;
