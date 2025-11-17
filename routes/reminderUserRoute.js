import express from "express";
import sendReminder from "../controllers/sendReminder.js";
import { emailLimiter } from "../middlewares/apiRateLimit.js";

const sendReminderRoute = express.Router();

sendReminderRoute.post("/send-reminder", emailLimiter, sendReminder);

export default sendReminderRoute;