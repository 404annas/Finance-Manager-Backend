import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUserDashboard } from "../controllers/userController.js";

const userDashboardRoutes = express.Router();

userDashboardRoutes.get("/", authMiddleware, getUserDashboard);

export default userDashboardRoutes;
