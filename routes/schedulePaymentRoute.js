import express from "express";
import { addSchedule, getSchedules, deleteSchedule, deleteAllSchedules, updateSchedule } from "../controllers/schedulePayment.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter, transactionLimiter } from "../middlewares/apiRateLimit.js";

const schedulePaymentRoute = express.Router();

schedulePaymentRoute.post("/schedule-payment", authMiddleware, transactionLimiter, addSchedule);
schedulePaymentRoute.get("/schedules", authMiddleware, apiLimiter, getSchedules);
schedulePaymentRoute.put("/schedule/:id", authMiddleware, transactionLimiter, updateSchedule);
schedulePaymentRoute.delete("/schedule/:id", authMiddleware, transactionLimiter, deleteSchedule);
schedulePaymentRoute.delete("/schedules", authMiddleware, transactionLimiter, deleteAllSchedules);

export default schedulePaymentRoute;