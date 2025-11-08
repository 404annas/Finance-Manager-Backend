import express from "express";
import { createTransaction, getUserTransactions, deleteTransaction, deleteAllTransactions, updateTransaction } from "../controllers/transactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const transactionRoute = express.Router();

transactionRoute.post("/transactions", authMiddleware, upload.single("image"), createTransaction);
transactionRoute.get("/transactions", authMiddleware, getUserTransactions);
transactionRoute.put("/transactions/:id", authMiddleware, upload.single("image"), updateTransaction);
transactionRoute.delete("/transactions/:id", authMiddleware, deleteTransaction);
transactionRoute.delete("/transactions", authMiddleware, deleteAllTransactions);

export default transactionRoute;