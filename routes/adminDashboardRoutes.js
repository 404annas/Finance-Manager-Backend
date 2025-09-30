import express from "express";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { getAdminDashboard } from "../controllers/userController.js";

const adminDashboardRoutes = express.Router();

adminDashboardRoutes.get("/admin-dashboard", authMiddleware, isAdmin, getAdminDashboard);

export default adminDashboardRoutes;
