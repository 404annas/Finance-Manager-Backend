import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter } from "../middlewares/apiRateLimit.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard/stats", authMiddleware, apiLimiter, getDashboardStats);

export default dashboardRouter;