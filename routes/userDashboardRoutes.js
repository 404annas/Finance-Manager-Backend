import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUserDashboard } from "../controllers/userController.js";
import { apiLimiter } from "../middlewares/apiRateLimit.js";

const userDashboardRoutes = express.Router();

userDashboardRoutes.get("/", authMiddleware, apiLimiter, getUserDashboard);

export default userDashboardRoutes;
