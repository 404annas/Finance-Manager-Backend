import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard/stats", authMiddleware, getDashboardStats);

export default dashboardRouter;