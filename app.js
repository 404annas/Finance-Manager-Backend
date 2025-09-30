import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import userDashboardRoutes from "./routes/userDashboardRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import inviteRoute from "./routes/inviteRoutes.js";
import getUsersRoute from "./routes/getUsersRoute.js";
import deleteUserRoute from "./routes/deleteUserRoute.js";
import sendReminderRoute from "./routes/reminderUserRoute.js";
import paymentsDoneRoute from "./routes/paymentsDoneRoute.js";
import schedulePaymentRoute from "./routes/schedulePaymentRoute.js";
import "./config/cron.js";
import contactRoute from "./routes/contactRoute.js";
import transactionRoute from "./routes/transactionRoute.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
    res.send("App is running");
})

app.use("/api", userRoutes);
app.use("/api", userDashboardRoutes);
app.use("/api", adminDashboardRoutes);
app.use("/api", inviteRoute);
app.use("/api", getUsersRoute);
app.use("/api", deleteUserRoute)
app.use("/api", sendReminderRoute);
app.use("/api", paymentsDoneRoute);
app.use("/api", schedulePaymentRoute);
app.use("/api", contactRoute);
app.use("/api", transactionRoute);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));