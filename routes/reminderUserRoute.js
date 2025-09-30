import express from "express";
import sendReminder from "../controllers/sendReminder.js";

const sendReminderRoute = express.Router();

sendReminderRoute.post("/send-reminder", sendReminder);

export default sendReminderRoute;