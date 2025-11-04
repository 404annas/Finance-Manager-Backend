import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import userDashboardRoutes from "./routes/userDashboardRoutes.js";
import inviteRoute from "./routes/inviteRoutes.js";
import getUsersRoute from "./routes/getUsersRoute.js";
import deleteUserRoute from "./routes/deleteUserRoute.js";
import sendReminderRoute from "./routes/reminderUserRoute.js";
import paymentsDoneRoute from "./routes/paymentsDoneRoute.js";
import schedulePaymentRoute from "./routes/schedulePaymentRoute.js";
import "./config/cron.js";
import contactRoute from "./routes/contactRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import shareRoute from "./routes/shareRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import notificationRouter from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://finance-manage-kappa.vercel.app", "https://finance-manageb-b.vercel.app"],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "https://finance-manage-kappa.vercel.app", "https://finance-manageb-b.vercel.app"],
        methods: ["GET", "POST"],
    },
})

app.use((req, res, next) => {
    req.io = io;
    next();
})

// --- (NEW) Socket.IO Connection and Authentication Logic ---
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication Error: Token not provided"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication Error: Invalid token"));
        }
        socket.userId = decoded.id; // Attach the user ID from your JWT payload
        next();
    });
});

io.on("connection", (socket) => {
    // console.log(`✅ User connected: ${socket.id} with User ID: ${socket.userId}`);

    // Join a personal room for targeted notifications
    socket.join(socket.userId);

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});
// --- End of New Socket.IO Code ---

app.get("/", (req, res) => {
    res.send("FinSync Manager - App is running");
})

app.use("/api", userRoutes);
app.use("/api", userDashboardRoutes);
app.use("/api", inviteRoute);
app.use("/api", getUsersRoute);
app.use("/api", deleteUserRoute)
app.use("/api", sendReminderRoute);
app.use("/api", paymentsDoneRoute);
app.use("/api", schedulePaymentRoute);
app.use("/api", contactRoute);
app.use("/api", transactionRoute);
app.use("/api", shareRoute);
app.use("/api", paymentRoute);
app.use("/api", notificationRouter);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));