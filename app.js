import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5174",
    credentials: true
}));

app.use(express.json());

connectToDB();

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("🚀 Finance Manager Is Running...");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});