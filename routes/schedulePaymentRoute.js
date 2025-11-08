import express from "express";
import { addSchedule, getSchedules, deleteSchedule, deleteAllSchedules, updateSchedule } from "../controllers/schedulePayment.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const schedulePaymentRoute = express.Router();

schedulePaymentRoute.post("/schedule-payment", authMiddleware, addSchedule);
schedulePaymentRoute.get("/schedules", authMiddleware, getSchedules);
schedulePaymentRoute.put("/schedule/:id", authMiddleware, updateSchedule);
schedulePaymentRoute.delete("/schedule/:id", authMiddleware, deleteSchedule);
schedulePaymentRoute.delete("/schedules", authMiddleware, deleteAllSchedules);

export default schedulePaymentRoute;