import express from "express";
import { createTransaction, getUserTransactions, deleteTransaction, deleteAllTransactions, updateTransaction } from "../controllers/transactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
import { apiLimiter, transactionLimiter } from "../middlewares/apiRateLimit.js";

const transactionRoute = express.Router();

transactionRoute.post("/transactions", authMiddleware, apiLimiter, upload.single("image"), createTransaction);
transactionRoute.get("/transactions", authMiddleware, transactionLimiter, getUserTransactions);
transactionRoute.put("/transactions/:id", authMiddleware, transactionLimiter, upload.single("image"), updateTransaction);
transactionRoute.delete("/transactions/:id", authMiddleware, transactionLimiter, deleteTransaction);
transactionRoute.delete("/transactions", authMiddleware, transactionLimiter, deleteAllTransactions);

export default transactionRoute;